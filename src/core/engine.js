// 引入核心模組
import { EventSystem } from "./events";
import { ResourceLoadManager } from "./loader";
import { TemporaryIdentityManager } from "./identity";
import { StorageManager } from "./storage";

// 引入核心樣式
import "../ui/styles/core.css";

/**
 * 艾利門特亞遊戲引擎
 * 負責初始化遊戲系統並協調各模組
 */
class ElementariaEngine {
    constructor() {
        this.initialized = false;
        this.events = null;
        this.resourceManager = null;
        this.identityManager = null;
        this.storageManager = null;

        // 初始化配置
        this.config = {
            initialLoadSizeLimit: 300 * 1024, // 300KB
            defaultArea: "harmony_village",
            wsServerUrl: "wss://elementaria-server.example.com",
        };
    }

    /**
     * 初始化遊戲引擎
     */
    async initialize() {
        console.log("艾利門特亞引擎初始化中...");

        // 初始化事件系統
        this.events = new EventSystem();

        // 初始化存儲管理器
        this.storageManager = new StorageManager();
        this.storageManager.initialize();

        // 初始化資源載入管理器
        this.resourceManager = new ResourceLoadManager(this.events);

        // 初始化臨時身份管理器
        this.identityManager = new TemporaryIdentityManager(
            this.storageManager
        );
        const identity = await this.identityManager.initializeIdentity();

        // 載入核心資源
        this.updateLoadingProgress(10, "載入核心系統...");
        await this.resourceManager.loadCoreResources();

        // 處理玩家身份
        this.updateLoadingProgress(30, "準備玩家數據...");
        if (identity.isNewPlayer) {
            // 新玩家，將在資源載入後顯示名稱輸入界面
            this.events.trigger("ui:showNameInput");
        } else {
            // 返回玩家，載入上次遊戲狀態
            await this.loadPlayerState(identity);
        }

        // 載入當前區域資源
        this.updateLoadingProgress(50, "載入遊戲區域...");
        const initialArea =
            this.storageManager.getItem("lastArea") || this.config.defaultArea;
        await this.resourceManager.loadAreaResources(initialArea);

        // 後續初始化 (UI、連接等)
        await this.initializeSubsystems(initialArea);

        this.initialized = true;
        this.updateLoadingProgress(100, "遊戲準備完成!");

        // 通知遊戲已準備就緒
        setTimeout(() => {
            this.events.trigger("game:ready");
            this.hideLoadingScreen();
        }, 500);

        console.log("艾利門特亞引擎初始化完成");
        return true;
    }

    /**
     * 初始化其他子系統
     */
    async initializeSubsystems(initialArea) {
        this.updateLoadingProgress(70, "初始化遊戲系統...");

        // 動態引入UI系統
        const { UISystem } = await import("../ui/uiSystem");
        this.ui = new UISystem(this.events);
        this.ui.initialize();

        // 動態引入玩家系統
        const { PlayerSystem } = await import("../player/character");
        this.player = new PlayerSystem(this.events, this.identityManager);
        await this.player.initialize();

        // 動態引入世界系統
        const { WorldSystem } = await import("../world/state");
        this.world = new WorldSystem(this.events, initialArea);
        await this.world.initialize();

        // 動態引入元素魔法系統
        const { ElementalMagicSystem } = await import(
            "../magic/elements/elementSystem"
        );
        this.magicSystem = new ElementalMagicSystem(this.events);
        this.magicSystem.initialize();

        // 最後初始化網絡連接 (可選)
        try {
            const { ConnectionManager } = await import("../network/connection");
            this.connection = new ConnectionManager(
                this.events,
                this.config.wsServerUrl,
                this.identityManager
            );
            this.connection.initialize();
        } catch (error) {
            console.warn("網絡連接模塊載入失敗，將以單人模式運行", error);
            this.events.trigger("connection:offline");
        }

        this.updateLoadingProgress(90, "正在完成設置...");

        // 在空閒時預載相鄰區域資源
        this.scheduleAdjacentAreasPreload(initialArea);
    }

    /**
     * 更新載入進度顯示
     */
    updateLoadingProgress(percentage, message) {
        const progressBar = document.querySelector(".loading-progress");
        const loadingScreen = document.getElementById("loading-screen");

        if (progressBar) {
            progressBar.style.width = `${percentage}%`;
        }

        if (message) {
            // 創建或更新消息元素
            let messageEl = document.querySelector(".loading-message");
            if (!messageEl) {
                messageEl = document.createElement("div");
                messageEl.className = "loading-message";
                loadingScreen.appendChild(messageEl);
            }
            messageEl.textContent = message;
        }
    }

    /**
     * 隱藏載入畫面
     */
    hideLoadingScreen() {
        const loadingScreen = document.getElementById("loading-screen");
        const gameUI = document.getElementById("game-ui");

        if (loadingScreen && gameUI) {
            loadingScreen.style.opacity = "0";
            gameUI.style.display = "block";

            setTimeout(() => {
                loadingScreen.style.display = "none";
            }, 500);
        }
    }

    /**
     * 安排預載相鄰區域資源
     */
    scheduleAdjacentAreasPreload(currentArea) {
        if ("requestIdleCallback" in window) {
            requestIdleCallback(() => {
                this.resourceManager.preloadAdjacentAreas(currentArea);
            });
        } else {
            setTimeout(() => {
                this.resourceManager.preloadAdjacentAreas(currentArea);
            }, 3000);
        }
    }

    /**
     * 載入玩家狀態
     */
    async loadPlayerState(identity) {
        // 從本地存儲加載玩家數據
        const playerState = this.storageManager.getItem("playerState");
        if (playerState) {
            this.events.trigger("player:stateLoaded", playerState);
        }

        return true;
    }
}

// 創建遊戲引擎實例
const gameEngine = new ElementariaEngine();

// DOM加載完成後初始化引擎
document.addEventListener("DOMContentLoaded", () => {
    gameEngine.initialize().catch((error) => {
        console.error("遊戲初始化失敗:", error);
        gameEngine.updateLoadingProgress(0, "初始化失敗，請刷新頁面重試");
    });
});

// 導出引擎實例，供其他模塊使用
export default gameEngine;
