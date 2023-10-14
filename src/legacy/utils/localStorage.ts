// // Credit: https://upmostly.com/next-js/using-localstorage-in-next-js

// import { useEffect, useState } from "react";

// export function useLocalStorage<T>(key: string, fallbackValue: T) {
//     const [value, setValue] = useState(
//         JSON.parse(localStorage.getItem(key) ?? JSON.stringify(fallbackValue))
//     );

//     useEffect(() => {!
//         localStorage.setItem(key, JSON.stringify(value));
//     }, [key, value]);

//     return [value, setValue] as const;
// }
