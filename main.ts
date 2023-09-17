import EnvLoader from "#utils/EnvLoader";
import App from "./src/App";

(async (): Promise<void> => {
    new EnvLoader(`${__dirname}/.env`).loadFile().then((): void => {
        const app = new App();
        app.init().then(() => {
            app.start();
        })
    })
})();
