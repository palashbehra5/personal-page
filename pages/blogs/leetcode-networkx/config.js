// API Configuration
const config = {
    PUBLIC_API_BASE_URL: "https://51.20.129.104:8443",
    LOCAL_API_BASE_URL: "http://127.0.0.1:5000",
    DEFAULT_USE_LOCAL: false,

    getBaseUrl: () => {
        const useLocal = localStorage.getItem('useLocalApi') === 'true' || config.DEFAULT_USE_LOCAL;
        return useLocal ? config.LOCAL_API_BASE_URL : config.PUBLIC_API_BASE_URL;
    },
    
    toggleApi: () => {
        const current = localStorage.getItem('useLocalApi') === 'true';
        const newValue = !current;
        localStorage.setItem('useLocalApi', newValue);
        return newValue;
    },
    
    isLocal: () => {
        return localStorage.getItem('useLocalApi') === 'true' || config.DEFAULT_USE_LOCAL;
    }
};