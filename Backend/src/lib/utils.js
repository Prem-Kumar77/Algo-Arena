import JWT from "jsonwebtoken";

const generateToken = (user, res) => {
  if (!user || !user.id) {
    throw new Error("Invalid user");
  }

  const payload = {
    id: user.id,
    role: user.role,
  };

  const token = JWT.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
  const refreshToken = JWT.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: "Strict",
    path: "/",
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: "Strict",
    path: "/",
  });

  return { token, refreshToken };
};

export default generateToken;
