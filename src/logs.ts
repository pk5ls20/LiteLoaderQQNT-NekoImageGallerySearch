const log = (...args: any[]) => {
    console.log("[Plugin-NekoImage]", new Date().toLocaleString(), ...args);
}

export { log };