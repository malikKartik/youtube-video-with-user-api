const express = require('express')
const router = new express.Router()
const auth = require('../middleware/auth')
const User = require('../models/user')
// const bcrypt = require('bcryptjs')

router.post('/users',async (req,res)=>{
    const user = new User(req.body)
    
    // performing the needful operation using promises for this remove the async from up above
    // user.save().then(()=>{
    //     res.status(201).send(user)
    // }).catch((e)=>{
    //     res.status(400)
    //     res.send(e)
    // })

    // one way of hasing the password but hashing is done in user model file
    // user.password = await bcrypt.hash(user.password,8)

    //perfroming the needful operation using async and await
    try{
        await user.save()
        //const user = await User.findByCredentials(req.body.email,req.body.password)
        const token = await user.generateAuthToken()
        res.status(201).send({user,token})
    } catch(e){
        res.status(400).send(e)
    }
    
    
})

router.post('/users/login', async(req,res)=>{
    try{
        const user = await User.findByCredentials(req.body.email,req.body.password)
        const token = await user.generateAuthToken()
        res.send({user,token})
    }catch(e){
        res.status(400).send()
    }
})

router.post('/users/logout',auth,async(req,res)=>{
    try{
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token !== req.token
        })
        
        await req.user.save()

        res.send()
    }catch(e){
        res.status(500).send()
    }
})

router.post('/users/logoutall',auth,async(req,res)=>{
    try{
        req.user.tokens = []
        await req.user.save()

        res.send()
    }catch(e){
        res.status(500).send()
    }
})
//To get all user
// router.get('/users',auth,async (req,res)=>{

//     // User.find().then((users)=>{
//     //     res.send(users)
//     // }).catch(()=>{
//     //     res.status(500).send()
//     // })

//     try{
//         const users = await User.find()
//         res.send(users)
//     } catch(e){
//         res.status(500).send()
//     }
    
// })


router.get('/users/me',auth,async (req,res)=>{
    res.send(req.user)
})

router.patch('/users/:id',auth,async (req,res)=>{
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name','email','password','age']
    const isValidOperation = updates.every((update)=>{
        return allowedUpdates.includes(update)
    })
    if(!isValidOperation){
        return res.status(400).send({error:'Invalid updates!'})
    }
    try{

        const user = await User.findById(req.params.id)

        updates.forEach((update)=>{
            user[update] = req.body[update]
        })

        await user.save()

        // const user = await User.findByIdAndUpdate(req.params.id,req.body,{new: true,runValidators: true})
        
        if(!user){
            return res.status(404).send('No user')
        }  
        res.send(user)
    } catch(e){
        res.status(500).send("something is not right")
    }
})

router.get('/users/:id',auth,async (req,res)=>{
    
    
    // User.findOne({
    //     _id: req.params.id
    // }).then((user)=>{
    //     if(!user){
    //         return res.status(404).send('User not found!')
    //     }
    //     res.send(user)
    // }).catch(()=>{
    //     res.status(400).send('Bad request')
    // })

    try{
        const user = await User.findOne({_id: req.params.id})
        if(!user){
            return res.status(404).send('User not found')
        }
        res.status(200).send(user)
    } catch(e){
        res.status(400).send('Bad request')
    }
})





router.delete('/users/:id',auth , async (req,res)=>{
    try{
        const user = await User.findByIdAndDelete(req.params.id)
        if(!user){
            return res.status(404).send({error:"Not found"})
        }
        res.send(user)
    }catch(e){
        res.status(400).send({error:"something is not as expected"})
    }
})

module.exports = router