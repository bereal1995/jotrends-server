export const validate = {
  username: (username: string) => /^[a-z0-9]{5,20}$/.test(username),
  password: (password: string) => {
    const passwordRules = [/[a-zA-Z]/, /[0-9]/, /[^A-Za-z0-9]/]
    if (password.length < 8) return false

    const counter = passwordRules.reduce((acc, rule) => {
      if (rule.test(password)) acc++
      return acc
    }, 0)

    return counter > 1
  },
}
