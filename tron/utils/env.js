export function getEnv(network, name) {
    return process.env[`${network.toUpperCase()}_${name}`];
}

export function getRequiredEnv(network, name) {
    const fullName = `${network.toUpperCase()}_${name}`;
    const value = process.env[fullName];
    if (!value) {
        throw new Error(`Environment variable ${fullName} is not defined`);
    }
    return value;
}
