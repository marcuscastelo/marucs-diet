import supabase from '~/legacy/utils/supabase'
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
  handleApiError,
  handleValidationError,
} from '~/shared/error/errorHandler'
import { parseWithStack } from '~/shared/utils/parseWithStack'

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
      handleApiError(error, {
        component: 'supabaseRecipeRepository',
        operation: 'fetchUserRecipes',
        additionalData: { userId },
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
    handleApiError(err, {
      component: 'supabaseRecipeRepository',
      operation: 'fetchUserRecipes',
      additionalData: { userId },
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
      handleApiError(error, {
        component: 'supabaseRecipeRepository',
        operation: 'fetchRecipeById',
        additionalData: { id },
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
      handleApiError('Recipe not found', {
        component: 'supabaseRecipeRepository',
        operation: 'fetchRecipeById',
        additionalData: { id },
      })
      throw new Error(`Recipe with id ${id} not found`)
    }
    return recipes[0]
  } catch (err) {
    handleApiError(err, {
      component: 'supabaseRecipeRepository',
      operation: 'fetchRecipeById',
      additionalData: { id },
    })
    throw err
  }
}

/**
 * Fetches a user's recipe by name.
 * Throws on error.
 * @param userId - The user ID
 * @param name - The recipe name
 * @returns Array of recipes
 * @throws Error on API/validation error
 */
const fetchUserRecipeByName = async (
  userId: User['id'],
  name: Recipe['name'],
): Promise<Recipe[]> => {
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select()
      .eq('owner', userId)
      .eq('name', name)
    if (error !== null) {
      handleApiError(error, {
        component: 'supabaseRecipeRepository',
        operation: 'fetchUserRecipeByName',
        additionalData: { userId, name },
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
    handleApiError(err, {
      component: 'supabaseRecipeRepository',
      operation: 'fetchUserRecipeByName',
      additionalData: { userId, name },
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
      handleApiError(error, {
        component: 'supabaseRecipeRepository',
        operation: 'insertRecipe',
        additionalData: { recipe: newRecipe },
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
      handleApiError('Recipe not created', {
        component: 'supabaseRecipeRepository',
        operation: 'insertRecipe',
        additionalData: { recipe: newRecipe },
      })
      throw new Error('Recipe not created')
    }
    return recipes[0]
  } catch (err) {
    handleApiError(err, {
      component: 'supabaseRecipeRepository',
      operation: 'insertRecipe',
      additionalData: { recipe: newRecipe },
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
      handleApiError(error, {
        component: 'supabaseRecipeRepository',
        operation: 'updateRecipe',
        additionalData: { id: recipeId, recipe: newRecipe },
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
      handleApiError('Recipe not found after update', {
        component: 'supabaseRecipeRepository',
        operation: 'updateRecipe',
        additionalData: { id: recipeId, recipe: newRecipe },
      })
      throw new Error(`Recipe with id ${recipeId} not found after update`)
    }
    return recipes[0]
  } catch (err) {
    handleApiError(err, {
      component: 'supabaseRecipeRepository',
      operation: 'updateRecipe',
      additionalData: { id: recipeId, recipe: newRecipe },
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
      handleApiError(error, {
        component: 'supabaseRecipeRepository',
        operation: 'deleteRecipe',
        additionalData: { id },
      })
      throw error
    }
  } catch (err) {
    handleApiError(err, {
      component: 'supabaseRecipeRepository',
      operation: 'deleteRecipe',
      additionalData: { id },
    })
    throw err
  }
}
