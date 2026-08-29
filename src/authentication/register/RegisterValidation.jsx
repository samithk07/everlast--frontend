import * as Yup from 'yup'

export const RegisterValidation = Yup.object({
  name: Yup.string()
    .trim()
    .matches(/^[A-Za-z]+(?:\s+[A-Za-z]+)*$/, "Name can only contain letters")
    .min(4, "Name must be at least 4 characters")
    .required("Please enter your name"),

  email: Yup.string()
    .trim()
    .lowercase()
    .email("Please enter a valid email")
    .required("Please enter your email"),

  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Please enter a password"),

  cpassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords do not match")
    .required("Please confirm your password"),
})