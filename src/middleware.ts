import { defineMiddleware } from 'astro:middleware'

export const onRequest = defineMiddleware((context, next) => {
  // Your middleware logic here
  const lang = context.request.headers.get('Accept-Language')
  const longCode = lang?.split(',')[0] || 'en'
  console.log(`Preferred language: ${longCode}`)
  if (longCode.startsWith('en-US')) {
    context.locals.title_md = 'Welcome to our US site!'
  }else{
    context.locals.title_md = 'Welcome to our site!'
  }
  return next()
})

