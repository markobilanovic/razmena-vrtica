if (!process.env.JWT_SECRET) {
  throw new Error(
    'JWT_SECRET environment variable is not set. Please configure it in your .env file.',
  );
}

export const jwtConstants = {
  secret: process.env.JWT_SECRET,
};
