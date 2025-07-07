import {
  type NewRecipe,
  type Recipe,
} from '~/modules/diet/recipe/domain/recipe'
import { type RecipeRepository } from '~/modules/diet/recipe/domain/recipeRepository'
import {
  createInsertRecipeDAOFromNewRecipe,
  createRecipeFromDAO,
  createUpdateRecipeDAOFromRecipe,
  recipeDAOSchema,
} from '~/modules/diet/recipe/infrastructure/recipeDAO'
import { type User } from '~/modules/user/domain/user'
import {
  handleInfrastructureError,
  handleValidationError,
} from '~/shared/error/errorHandler'
import { parseWithStack } from '~/shared/utils/parseWithStack'
import { removeDiacritics } from '~/shared/utils/removeDiacritics'
import supabase from '~/shared/utils/supabase'

const TABLE = 'recipes'

export function createSupabaseRecipeRepository(): RecipeRepository {
  return {
    fetchUserRecipes,
    fetchRecipeById,
    fetchUserRecipeByName,
    insertRecipe,
    updateRecipe,
    deleteRecipe,
  }
}

/**
 * Fetches all recipes for a user.
 * Throws on error.
 * @param userId - The user ID
 * @returns Array of recipes
 * @throws Error on API/validation error
 */
const fetchUserRecipes = async (userId: User['id']): Promise<Recipe[]> => {
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select()
      .eq('owner', userId)
    if (error !== null) {
      handleInfrastructureError(error, {
        operation: 'infraOperation',
        entityType: 'Infrastructure',
        module: 'infrastructure',
        component: 'repository',
      })
      throw error
    }
    let recipeDAOs
    try {
      recipeDAOs = parseWithStack(recipeDAOSchema.array(), data)
    } catch (validationError) {
      handleValidationError(validationError, {
        component: 'supabaseRecipeRepository',
        operation: 'fetchUserRecipes',
        additionalData: { userId },
      })
      throw validationError
    }
    return recipeDAOs.map(createRecipeFromDAO)
  } catch (err) {
    handleInfrastructureError(err, {
      operation: 'repositoryOperation',
      entityType: 'Repository',
      module: 'infrastructure',
      component: 'repository',
    })
    throw err
  }
}

/**
 * Fetches a recipe by its ID.
 * Throws on error or if not found.
 * @param id - The recipe ID
 * @returns The recipe
 * @throws Error if not found or on API/validation error
 */
const fetchRecipeById = async (id: Recipe['id']): Promise<Recipe> => {
  try {
    const { data, error } = await supabase.from(TABLE).select().eq('id', id)
    if (error !== null) {
      handleInfrastructureError(error, {
        operation: 'infraOperation',
        entityType: 'Infrastructure',
        module: 'infrastructure',
        component: 'repository',
      })
      throw error
    }
    let recipeDAOs
    try {
      recipeDAOs = parseWithStack(recipeDAOSchema.array(), data)
    } catch (validationError) {
      handleValidationError(validationError, {
        component: 'supabaseRecipeRepository',
        operation: 'fetchRecipeById',
        additionalData: { id },
      })
      throw validationError
    }
    const recipes = recipeDAOs.map(createRecipeFromDAO)
    if (!recipes[0]) {
      handleInfrastructureError(new Error('Recipe not found'), {
        operation: 'getRecipeById',
        entityType: 'Recipe',
        module: 'diet/recipe',
        component: 'supabaseRecipeRepository',
      })
      throw new Error(`Recipe with id ${id} not found`)
    }
    return recipes[0]
  } catch (err) {
    handleInfrastructureError(err, {
      operation: 'repositoryOperation',
      entityType: 'Repository',
      module: 'infrastructure',
      component: 'repository',
    })
    throw err
  }
}

/**
 * Fetches a user's recipe by name (partial, case-insensitive, diacritic-insensitive).
 * Throws on error.
 * @param userId - The user ID
 * @param name - The recipe name (partial or full)
 * @returns Array of recipes
 * @throws Error on API/validation error
 */
const fetchUserRecipeByName = async (
  userId: User['id'],
  name: Recipe['name'],
): Promise<Recipe[]> => {
  try {
    // Normalize diacritics for search
    const normalizedName = removeDiacritics(name)
    const { data, error } = await supabase
      .from(TABLE)
      .select()
      .eq('owner', userId)
      .ilike('name', `%${normalizedName}%`)
    if (error !== null) {
      handleInfrastructureError(error, {
        operation: 'infraOperation',
        entityType: 'Infrastructure',
        module: 'infrastructure',
        component: 'repository',
      })
      throw error
    }
    let recipeDAOs
    try {
      recipeDAOs = parseWithStack(recipeDAOSchema.array(), data)
    } catch (validationError) {
      handleValidationError(validationError, {
        component: 'supabaseRecipeRepository',
        operation: 'fetchUserRecipeByName',
        additionalData: { userId, name },
      })
      throw validationError
    }
    return recipeDAOs.map(createRecipeFromDAO)
  } catch (err) {
    handleInfrastructureError(err, {
      operation: 'repositoryOperation',
      entityType: 'Repository',
      module: 'infrastructure',
      component: 'repository',
    })
    throw err
  }
}

/**
 * Inserts a new recipe.
 * Throws on error or if not created.
 * @param newRecipe - The new recipe
 * @returns The created recipe
 * @throws Error if not created or on API/validation error
 */
const insertRecipe = async (newRecipe: NewRecipe): Promise<Recipe> => {
  try {
    const createDAO = createInsertRecipeDAOFromNewRecipe(newRecipe)
    const { data, error } = await supabase
      .from(TABLE)
      .insert(createDAO)
      .select()
    if (error !== null) {
      handleInfrastructureError(error, {
        operation: 'infraOperation',
        entityType: 'Infrastructure',
        module: 'infrastructure',
        component: 'repository',
      })
      throw error
    }
    let recipeDAOs
    try {
      recipeDAOs = parseWithStack(recipeDAOSchema.array(), data)
    } catch (validationError) {
      handleValidationError(validationError, {
        component: 'supabaseRecipeRepository',
        operation: 'insertRecipe',
        additionalData: { recipe: newRecipe },
      })
      throw validationError
    }
    const recipes = recipeDAOs.map(createRecipeFromDAO)
    if (!recipes[0]) {
      handleInfrastructureError(new Error('Recipe not created'), {
        operation: 'insertRecipe',
        entityType: 'Recipe',
        module: 'diet/recipe',
        component: 'supabaseRecipeRepository',
      })
      throw new Error('Recipe not created')
    }
    return recipes[0]
  } catch (err) {
    handleInfrastructureError(err, {
      operation: 'repositoryOperation',
      entityType: 'Repository',
      module: 'infrastructure',
      component: 'repository',
    })
    throw err
  }
}

/**
 * Updates a recipe.
 * Throws on error or if not found after update.
 * @param recipeId - The recipe ID
 * @param newRecipe - The new recipe data
 * @returns The updated recipe
 * @throws Error if not found or on API/validation error
 */
const updateRecipe = async (
  recipeId: Recipe['id'],
  newRecipe: Recipe,
): Promise<Recipe> => {
  try {
    const updateDAO = createUpdateRecipeDAOFromRecipe(newRecipe)
    const { data, error } = await supabase
      .from(TABLE)
      .update(updateDAO)
      .eq('id', recipeId)
      .select()
    if (error !== null) {
      handleInfrastructureError(error, {
        operation: 'infraOperation',
        entityType: 'Infrastructure',
        module: 'infrastructure',
        component: 'repository',
      })
      throw error
    }
    let recipeDAOs
    try {
      recipeDAOs = parseWithStack(recipeDAOSchema.array(), data)
    } catch (validationError) {
      handleValidationError(validationError, {
        component: 'supabaseRecipeRepository',
        operation: 'updateRecipe',
        additionalData: { id: recipeId, recipe: newRecipe },
      })
      throw validationError
    }
    const recipes = recipeDAOs.map(createRecipeFromDAO)
    if (!recipes[0]) {
      handleInfrastructureError(new Error('Recipe not found after update'), {
        operation: 'updateRecipe',
        entityType: 'Recipe',
        module: 'diet/recipe',
        component: 'supabaseRecipeRepository',
      })
      throw new Error(`Recipe with id ${recipeId} not found after update`)
    }
    return recipes[0]
  } catch (err) {
    handleInfrastructureError(err, {
      operation: 'repositoryOperation',
      entityType: 'Repository',
      module: 'infrastructure',
      component: 'repository',
    })
    throw err
  }
}

/**
 * Deletes a recipe by ID.
 * Throws on error.
 * @param id - The recipe ID
 * @throws Error on API error
 */
const deleteRecipe = async (id: Recipe['id']): Promise<void> => {
  try {
    const { error } = await supabase.from(TABLE).delete().eq('id', id)
    if (error !== null) {
      handleInfrastructureError(error, {
        operation: 'infraOperation',
        entityType: 'Infrastructure',
        module: 'infrastructure',
        component: 'repository',
      })
      throw error
    }
  } catch (err) {
    handleInfrastructureError(err, {
      operation: 'repositoryOperation',
      entityType: 'Repository',
      module: 'infrastructure',
      component: 'repository',
    })
    throw err
  }
}
