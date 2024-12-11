/**
 * This is a utility file with the type declaration of the BasicIO function parameters
 */

/**
 * Type of the BasicIO object. Contains the functional APIs of BasicIO
 */
export interface BasicIO {
    /**
     * Write to the BasicIO output
     * @param value input string
     * @returns 
     */
    write: (value: string) => void;
    /**
     * Set the BasicIO status code
     * @param statusCode status code of BasicIO
     * @returns 
     */
    setStatus: (statusCode: number) => void;
    /**
     * Get the input argument values of the BasicIO
     * @param key argument name(key)
     * @returns argument value as string
     */
    getArgument: (key: string) => string;
    /**
     * Get all input arguments
     * @returns all arguments as key value pair
     */
    getAllArguments: () => Record<string, string>;
}

/**
 * Type of the context object of the function
 */
export interface Context {
    /**
     * Contains catalyst auth headers (for internal use)
     */
    catalystHeaders: Record<string, string>;
    /**
     * To indicate the end of a function execution
     * @returns 
     */
    close: () => void;
    /**
     * Fetch the remaining execution time of the function
     * @returns remaining execution time in milliseconds
     */
    getRemainingExecutionTimeMs: () => number;
    /**
     * Fetch the maximum execution time of the function
     * @returns maximum execution time in milliseconds
     */
    getMaxExecutionTimeMs: () => number;
}
