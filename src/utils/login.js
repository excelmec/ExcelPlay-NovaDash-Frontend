/**
 * First Extract refresh token from url if any
 */
var LOGGED_IN = false;
var LOGIN_LOADING = true;

var ACC_BACKEND_BASE_URL = process.env.NEXT_PUBLIC_ACC_BACKEND_BASE_URL;
var DOODLE_BACKEND_BASE_URL = process.env.NEXT_PUBLIC_DOODLE_BACKEND_BASE_URL;

var axiosAccPublic = axios.create({
    timeout: 10000,
    headers: {
        'Content-type': 'application/json',
    },
    baseURL: ACC_BACKEND_BASE_URL,
});
var axiosDoodleWithToken = axios.create({
    timeout: 10000,
    headers: {
        'Content-type': 'application/json',
    },
    baseURL: DOODLE_BACKEND_BASE_URL,
});

function checkRefreshFromUrl() {
    const currUrl = new URL(window.location.href);
    let newRefreshToken = currUrl.searchParams.get('refreshToken');
    if (newRefreshToken) {
        localStorage.setItem('refreshToken', newRefreshToken);
        currUrl.searchParams.delete('refreshToken');
        window.history.replaceState({}, '', currUrl.toString());
    }
}

async function refreshTheAccessToken() {
    let loginPlayBtntext = "Login";
    try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
            return '';
        }

        const response = await axiosAccPublic.post(
            '/api/Auth/refresh',
            JSON.stringify({ refreshToken: refreshToken })
        );

        const { accessToken } = response.data;
        localStorage.setItem('accessToken', accessToken);
        LOGGED_IN = true;
        loginPlayBtntext = "Play";

        var userDataBase64 = accessToken.split(".")[1];
        var userData = JSON.parse(atob(userDataBase64));
        const avatarElement = document.getElementById("avatarIcon");
        if (avatarElement) {
            avatarElement.src = userData.picture;
        }
        return accessToken;
    } catch (e) {
        console.log(e);
        localStorage.removeItem('refreshToken');
        LOGGED_IN = false;
    } finally {
        LOGIN_LOADING = false;
        const loginPlayButton = document.getElementById("play-login-btn");
        if (loginPlayButton) {
            loginPlayButton.innerText = loginPlayBtntext;
        }
    }

}

const attachAccessToken = (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken && accessToken.length > 0) {
        config.headers['Authorization'] = 'Bearer ' + accessToken;
        return config;
    } else {
        //Clear authorization
        config.headers['Authorization'] = '';
    }
    return config;
};

axiosDoodleWithToken.interceptors.request.use(attachAccessToken);

const retryWithAt = [
    (res) => {
        return res;
    },

    async (err) => {
        const originalConfig = err.config;

        if (
            !originalConfig._retry &&
            (err.response?.status === 401 || // For expired token
                err?.code === 'ECONNABORTED') // For cold start timeouts
        ) {
            console.log('Token Expired, Retrying');
            originalConfig._retry = true;

            try {
                const newAccessToken = await refreshTheAccessToken();
                originalConfig.headers['Authorization'] =
                    'Bearer ' + newAccessToken;

                return await axios(originalConfig);
            } catch (_error) {
                return Promise.reject(_error);
            }
        }
        return Promise.reject(err);
    },
];

const retryWithoutAt = [
    (res) => {
        return res;
    },

    async (err) => {
        const originalConfig = err.config;

        if (
            !originalConfig._retry &&
            (err.response?.status === 401 || // For expired token
                err?.code === 'ECONNABORTED') // For cold start timeouts
        ) {
            console.log('Retrying');
            originalConfig._retry = true;

            try {
                return await axios(originalConfig);
            } catch (_error) {
                return Promise.reject(_error);
            }
        }
        return Promise.reject(err);
    },
];

axiosDoodleWithToken.interceptors.response.use(...retryWithAt);
axiosAccPublic.interceptors.response.use(...retryWithoutAt);

async function fetchUserScoreRank() {
    try {
        const response = await axiosDoodleWithToken.get('/doodle/score');

        const highScoreElements = document.getElementsByClassName("your-highscore");
        const rankElements = document.getElementsByClassName("your-rank");
        const highscore = response.data.highscore;
        const rank = response.data.rank;

        for (const element of highScoreElements) {
            element.innerText = `your highscore: ${highscore}`;
        }

        for (const element of rankElements) {
            element.innerText = `your rank: ${rank}`;
        }

    } catch (e) {
        console.log(e);
    }
}

async function main() {
    checkRefreshFromUrl();
    await refreshTheAccessToken();
    await fetchUserScoreRank();
    if (LOGGED_IN) {
        console.log('Logged in');
    } else {
        console.log('Not Logged in');
    }
}

main();

async function logout() {
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('accessToken');
    window.location.href = "/index.html";
}

let avatarElement = document.getElementById("avatarIcon");
if (avatarElement) {
    avatarElement.addEventListener("click", logout);
}

setInterval(async () => {
    try {
        await refreshTheAccessToken();
    } catch (e) {
        console.log(e);
    }
    try {
        if (!LOGGED_IN) {
            const res = await axios.get(`${DOODLE_BACKEND_BASE_URL}/ping`)
        } else {
            await fetchUserScoreRank();
        }
    } catch (e) {
        console.log(e);
    }
}, 15000);