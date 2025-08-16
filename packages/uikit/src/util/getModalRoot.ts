// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const getModalRoot = () => typeof window !== "undefined" && (document.getElementById("__next") ?? document.body);

export default getModalRoot;
