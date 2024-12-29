export function getLoginUrl() {
    const authRedirBaseUrl = process.env.REACT_APP_AUTH_REDIR_URL;

    const currentUrl = new URL(window.location.href);
    const authUrl = new URL(authRedirBaseUrl);
    authUrl.searchParams.append('redirect_to', currentUrl.toString());

    return authUrl.toString();
}