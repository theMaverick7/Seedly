
const tokenGen = async(entity) => {
    try {

        const accessToken = entity.generateAccessToken()
        const refreshToken = entity.generateRefreshToken()
    
        entity.refreshToken = refreshToken
    
        await entity.save({validateBeforeSave: false})
        return {accessToken, refreshToken}

    } catch (error) {
        console.log(error)
    }
}

export {tokenGen}