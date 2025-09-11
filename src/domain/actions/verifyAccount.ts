import EncryptedStorage from "react-native-encrypted-storage"

export default async function verifyAccount(accountId: string, appId: string) {
  try {
    const response = await fetch('https://users.appstorys.com/validate-account', {
      method: 'POST',
      body: JSON.stringify({
        account_id: accountId,
        app_id: appId
      }),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
    })
    if (response.ok) {
      const data = await response.json()
      const {access_token, refresh_token} = data

      if (access_token && refresh_token) {
        await EncryptedStorage.setItem('access_token', access_token)
        await EncryptedStorage.setItem('refresh_token', refresh_token)
        return true
      }
    }
    return false
  } catch (error) {
    console.log(error)
    return false
  }
};
