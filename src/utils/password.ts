import bcryptjs from 'bcryptjs';
export async function saltAndHashPassword(password: string) {
  const salt = await bcryptjs.genSalt(10);
  const hashedPassword = await bcryptjs.hash(password, salt);
  return hashedPassword;
}

export const verifyPassword = async (password: string, hashedPassword: string) => {
  return bcryptjs.compare(password, hashedPassword);
};
