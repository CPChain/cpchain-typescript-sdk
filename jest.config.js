module.exports = {
  preset: 'ts-jest',
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
  transform: {
    '^.+\\.jsx?$': 'babel-jest'
  }
}
