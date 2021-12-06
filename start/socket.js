'use strict'

const Ws = use('Ws')

Ws.channel('notifications', 'NotificationController').middleware('auth')
