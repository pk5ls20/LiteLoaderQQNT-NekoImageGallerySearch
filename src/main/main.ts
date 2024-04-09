/// <reference path="../global.d.ts" />
import * as fs from 'node:fs';
const path = require('node:path');
import {log} from "../logs";
import {BrowserWindow, ipcMain, shell} from "electron";

function watchSettingsChange(webContents: Electron.WebContents, settingsPath: fs.PathLike) {
    fs.watch(settingsPath, "utf-8", debounce(() => {
        updateStyle(webContents, settingsPath);
    }, 100));
}

function openWeb(url: string) {
    shell.openExternal(url);
}

const pluginDataPath = LiteLoader.plugins["image_search"].path.data;
const settingsPath = path.join(pluginDataPath, "settings.json");

if (!fs.existsSync(pluginDataPath)) {
    fs.mkdirSync(pluginDataPath, { recursive: true });
}

if (!fs.existsSync(settingsPath)) {
    fs.writeFileSync(settingsPath, JSON.stringify({
        "nekoimage_api": "",
        "nekoimage_access_token": "",
        "nekoimage_admin_token": "",
    }));
} else {
    const data = fs.readFileSync(settingsPath, "utf-8");
    const config = JSON.parse(data);
}

ipcMain.on(
    "LiteLoader.imageSearch.watchSettingsChange",
    (event, settingsPath) => {
        const window = BrowserWindow.fromWebContents(event.sender);
        watchSettingsChange(window.webContents, settingsPath);
    });

ipcMain.handle(
    "LiteLoader.imageSearch.getSettings",
    (event, message) => {
        try {
            const data = fs.readFileSync(settingsPath, "utf-8");
            return JSON.parse(data);
        } catch (error) {
            log(error);
            return {};
        }
    }
);

ipcMain.handle(
    "LiteLoader.imageSearch.setSettings",
    (event, content) => {
        try {
            const new_config = JSON.stringify(content);
            fs.writeFileSync(settingsPath, new_config, "utf-8");
        } catch (error) {
            log(error);
        }
    }
);

ipcMain.on("LiteLoader.imageSearch.openWeb", (event, message) =>
    openWeb(message)
);

ipcMain.handle(
    "LiteLoader.imageSearch.logToMain",
    (event, ...args) => {
        log(...args);
    }
);
