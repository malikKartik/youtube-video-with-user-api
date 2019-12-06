const mongoose = require('mongoose')

mongoose.connect('mongodb://127.0.0.1:27017/video-control', {
    useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: false
})
