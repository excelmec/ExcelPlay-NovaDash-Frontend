// Extract refresh token from URL
export function checkRefreshFromUrl() {
  const hardcodedRefreshToken = "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiMTIyNTIiLCJlbWFpbCI6ImV4Y2VsY3N0ZWNoQGdtYWlsLmNvbSIsIm5iZiI6MTcyODkxNjcyMiwiZXhwIjoxNzYwNDUyNzIyLCJpYXQiOjE3Mjg5MTY3MjIsImlzcyI6Imh0dHA6Ly9leGNlbG1lYy5vcmcvIn0.zPiJiCZwA_QlQQQrgfhhpfAzSU1D19mwIDQCnnkLlllatEt-dhkZJ1FDYwfBcopisKKusB__WVwzr8g-SQK05Q";
  localStorage.setItem("refreshToken", hardcodedRefreshToken);
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
