import configureOpenAPI from '@/lib/configure-open-api'
import createApp from '@/lib/create-app'
import helloworld from '@/routes/helloworld.route'
import index from '@/routes/index.route'

const app = createApp()

configureOpenAPI(app)

app.route('/', index)
app.route('/hello', helloworld)

export default app
