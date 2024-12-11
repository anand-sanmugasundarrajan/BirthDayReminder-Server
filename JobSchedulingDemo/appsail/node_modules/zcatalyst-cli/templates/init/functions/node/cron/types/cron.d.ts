/**
 * This is a utility file with the type declaration of the Cron function parameters
 */

/**
 * Type of Cron Details object. Contains the details of the scheduled cron
 */
export interface CronDetails {
    /**
     * Get the input param value of the Cron function
     * @returns input param value
     */
    getCronParam: () => string;
    /**
     * Get all input params of the Cron function
     * @returns all input params as key value pairs
     */ 
    getAllCronParam: () => Record<string, string>;
    /**
     * Get the remaining execution count of the cron job
     * @returns remaining execution count
     */
    getRemainingExecutionCount: () => number;
    /**
     * Get the details of the cron which executed the function
     * @returns cron details
     */
    getCronDetails: () => Record<string, unknown>;
    /**
     * Get the current project details
     * @returns project details
     */
    getProjectDetails: () => Record<string, unknown>;
}

/**
 * Type of the Context object of the Cron function
 */
export interface Context {
    /**
     * Contains catalyst auth headers (for internal use)
     */
    catalystHeaders: Record<string, string>;
    /**
     * Close the Cron function with success response
     * @returns 
     */
    closeWithSuccess: () => void;
    /**
     * Close the Cron function failure response
     * @returns 
     */
    closeWithFailure: () => void;
    /**
     * Get the remaining execution time of the Cron function
     * @returns remaining execution time in milliseconds
     */
    getRemainingExecutionTimeMs: () => number;
    /**
     * Get the maximum possible execution time of the Cron function
     * @returns maximum possible execution time in milliseconds
     */
    getMaxExecutionTimeMs: () => number;
}
