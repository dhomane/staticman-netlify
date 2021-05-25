'use strict'

const config = require('../config')

const Notification = function (mailAgent) {
  this.mailAgent = mailAgent
}

Notification.prototype._slugToString = function (slug) {
  return slug.split('-')
    .map(w => w[0].toUpperCase() + w.substr(1).toLowerCase())
    .join(' ')
}

Notification.prototype._buildSubject = function (options, data) {
  if (options.slug == "newsletter-subscription") {
    return `Congratulations! You have subscribed to newsletters by Ruddra.com`
  } else {
    return data.siteName ? `New comment on Ruddra.com` : 'New comment on Ruddra.com'
  }
}

Notification.prototype._buildMessage = function (fields, options, data) {
  return `
  <html>
    <body>
      Dear human,<br>
      <br>
      Someone replied to a comment you subscribed to${data.siteName ? ` on <strong>${data.siteName}</strong>` : ''}.<br>
      <br>
      ${options.origin ? `<a href="${options.origin}">Click here</a> to see it.` : ''} If you do not wish to receive any further notifications for this thread, <a href="%mailing_list_unsubscribe_url%">click here</a>.<br>
      <br>
      #ftw,<br>
      -- <a href="https://staticman.net">Staticman</a>
    </body>
  </html>
  `
  }
}

Notification.prototype.send = function (to, fields, options, data) {
  console.log(to, fields, options, data)
  const subject = this._buildSubject(options, data)

  return new Promise((resolve, reject) => {
    if (options.slug == "newsletter-subscription") {
      return resolve({})
    }
    this.mailAgent.messages().send({
      from: `Ruddra.com <${config.get('email.fromAddress')}>`,
      to: to,
      subject,
      html: this._buildMessage(fields, options, data)
    }, (err, res) => {
      if (err) {
        return reject(err)
      }
      return resolve(res)
    })
  })
}

module.exports = Notification
