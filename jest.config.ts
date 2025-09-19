export default {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
    testMatch: ['**/*.(test|spec).(ts|tsx|js)'],
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
    },
}
