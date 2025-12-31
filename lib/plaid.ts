import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';

/**
 * Plaid Environment Configuration
 * Uses PLAID_ENV environment variable to determine which Plaid environment to use.
 * Valid values: 'sandbox', 'development', 'production'
 * Defaults to 'sandbox' for safety.
 */
const getPlaidEnvironment = () => {
  const env = process.env.PLAID_ENV || 'sandbox';
  
  switch (env) {
    case 'production':
      return PlaidEnvironments.production;
    case 'development':
      return PlaidEnvironments.development;
    case 'sandbox':
    default:
      return PlaidEnvironments.sandbox;
  }
};

/**
 * Get the appropriate Plaid secret based on environment
 * Production and Development use different secrets
 */
const getPlaidSecret = () => {
  const env = process.env.PLAID_ENV || 'sandbox';
  
  if (env === 'production') {
    return process.env.PLAID_SECRET_PRODUCTION || process.env.PLAID_SECRET!;
  }
  
  return process.env.PLAID_SECRET!;
};

const configuration = new Configuration({
  basePath: getPlaidEnvironment(),
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID!,
      'PLAID-SECRET': getPlaidSecret(),
    },
  },
});

export const plaidClient = new PlaidApi(configuration);

// Export environment info for logging/debugging
export const plaidEnvironment = process.env.PLAID_ENV || 'sandbox';
export const isProduction = plaidEnvironment === 'production';
