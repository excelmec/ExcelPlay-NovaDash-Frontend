// Extract refresh token from URL
export function checkRefreshFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  const refreshToken = urlParams.get("refreshToken");
    console.log("RefreshToken :",refreshToken);

  if (refreshToken) {
    localStorage.setItem("refreshToken", refreshToken);
    urlParams.delete("refreshToken");
    window.history.replaceState({}, "", `${window.location.pathname}`);
  }
}

// Refresh access token
export async function refreshTheAccessToken() {
  try {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      return null;
    }

    const response = await axiosAccPublic.post("/api/Auth/refresh", { refreshToken });
    const { accessToken } = response.data;

    localStorage.setItem("accessToken", accessToken);
    return accessToken;
  } catch (error) {
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("accessToken");
    return null;
  }
}
