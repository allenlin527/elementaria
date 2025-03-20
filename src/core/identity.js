/**
 * 臨時身份管理器
 * 負責在無需註冊的情況下提供一致的玩家身份識別
 */
export class TemporaryIdentityManager {
    constructor(storageManager) {
        this.storage = storageManager;

        // 存儲鍵定義
        this.STORAGE_KEYS = {
            PLAYER_ID: "elementaria_player_id",
            PLAYER_NAME: "elementaria_player_name",
            MAIN_ELEMENT: "elementaria_main_element",
            CREATION_TIME: "elementaria_creation_time",
            LAST_LOGIN: "elementaria_last_login",
        };
    }

    /**
     * 初始化玩家身份
     * @returns {Object} 玩家身份信息
     */
    async initializeIdentity() {
        // 檢查是否已有存儲的身份
        let playerId = this.storage.getItem(this.STORAGE_KEYS.PLAYER_ID);
        let isNewPlayer = false;

        if (!playerId) {
            // 生成新身份
            playerId = await this.generateNewIdentity();
            isNewPlayer = true;

            // 存儲新身份
            this.storage.setItem(this.STORAGE_KEYS.PLAYER_ID, playerId);
            this.storage.setItem(
                this.STORAGE_KEYS.CREATION_TIME,
                Date.now().toString()
            );
        }

        // 更新最後登入時間
        this.storage.setItem(
            this.STORAGE_KEYS.LAST_LOGIN,
            Date.now().toString()
        );

        return {
            id: playerId,
            name: this.storage.getItem(this.STORAGE_KEYS.PLAYER_NAME) || null,
            mainElement:
                this.storage.getItem(this.STORAGE_KEYS.MAIN_ELEMENT) || null,
            isNewPlayer: isNewPlayer,
        };
    }

    /**
     * 生成新的身份識別
     * @returns {string} 玩家識別ID
     */
    async generateNewIdentity() {
        // 收集瀏覽器特徵
        const browserFeatures = await this.collectBrowserFeatures();

        // 計算指紋雜湊
        const fingerprint = this.hashCode(browserFeatures.join("|"));

        // 添加時間戳和隨機元素增加唯一性
        const timestamp = Date.now().toString(36);
        const randomSuffix = Math.random().toString(36).substring(2, 7);

        return `${fingerprint}_${timestamp}_${randomSuffix}`;
    }

    /**
     * 收集瀏覽器特徵信息
     * @returns {Array} 特徵信息陣列
     */
    async collectBrowserFeatures() {
        const features = [
            navigator.userAgent,
            navigator.language,
            screen.colorDepth,
            screen.width,
            screen.height,
            new Date().getTimezoneOffset(),
            navigator.hardwareConcurrency,
            navigator.deviceMemory,
            navigator.platform,
        ];

        // 添加Canvas指紋
        try {
            const canvas = document.createElement("canvas");
            const gl =
                canvas.getContext("webgl") ||
                canvas.getContext("experimental-webgl");
            if (gl) {
                features.push(gl.getParameter(gl.VENDOR));
                features.push(gl.getParameter(gl.RENDERER));
            }
        } catch (e) {
            // Canvas指紋獲取失敗，忽略錯誤
        }

        return features.filter(Boolean); // 過濾掉undefined或null值
    }

    /**
     * 簡單雜湊函數
     * @param {string} str - 待雜湊字符串
     * @returns {string} 雜湊結果
     */
    hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = (hash << 5) - hash + str.charCodeAt(i);
            hash = hash & hash; // 轉為32位整數
        }
        return Math.abs(hash).toString(36).substring(0, 8);
    }

    /**
     * 更新玩家資料
     * @param {string} name - 玩家名稱
     * @param {string} mainElement - 主元素類型
     * @returns {Object} 更新後的玩家信息
     */
    updatePlayerInfo(name, mainElement) {
        this.storage.setItem(this.STORAGE_KEYS.PLAYER_NAME, name);
        this.storage.setItem(this.STORAGE_KEYS.MAIN_ELEMENT, mainElement);

        return {
            id: this.storage.getItem(this.STORAGE_KEYS.PLAYER_ID),
            name,
            mainElement,
            isNewPlayer: false,
        };
    }

    /**
     * 驗證身份是否有效
     * @returns {boolean} 身份是否有效
     */
    validateIdentity() {
        const playerId = this.storage.getItem(this.STORAGE_KEYS.PLAYER_ID);
        if (!playerId) return false;

        // 檢查創建時間是否存在
        const creationTime = parseInt(
            this.storage.getItem(this.STORAGE_KEYS.CREATION_TIME) || "0"
        );
        if (!creationTime) return false;

        // 其他驗證邏輯可以在這裡添加

        return true;
    }
}
