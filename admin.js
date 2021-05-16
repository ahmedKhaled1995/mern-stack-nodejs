const AdminBro = require('admin-bro')
const AdminBroExpress = require('admin-bro-expressjs')
const AdminBroMongoose = require('admin-bro-mongoose')


const User = require('./models/users');
const Category = require('./models/category');
const Author = require('./models/author');
const Book = require('./models/book');

AdminBro.registerAdapter(AdminBroMongoose)
const adminBro = new AdminBro({
    rootPath: '/admin',
    resources: [
        {
            resource: User,
            options: {
                // We'll add this later
            },

        },
        {
            resource: Category,
            options: {
                // We'll add this later
            }
        },
        {
            resource: Author,
            options: {
                // We'll add this later
            }
        },
        {
            resource: Book,
            options: {
                // We'll add this later
            }
        },
    ],
    branding: {
        companyName: 'Good Read Admin',
        softwareBrothers: false   // if Software Brothers logos should be shown in the sidebar footer
    },
})

module.exports = adminRouter = AdminBroExpress.buildRouter(adminBro)