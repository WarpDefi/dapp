// @ts-nocheck
// eslint-disable-next-line no-restricted-globals
self.addEventListener('push', function onPush(event) {
  if (!event.data) return
  const data = event.data.json()

  event.waitUntil(
    // eslint-disable-next-line no-restricted-globals
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: 'https://raw.githubusercontent.com/u2u-eco/default-token-list/master/logos/network/native-currency/2484.png',
      image:
        'https://raw.githubusercontent.com/u2u-eco/default-token-list/master/logos/network/native-currency/2484.png',
    }),
  )
})
