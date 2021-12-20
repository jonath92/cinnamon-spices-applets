const { addTween, removeTweens } = imports.ui.tweener

export function createRotateAnimation(icon:imports.gi.St.Icon){
    const tweenParams = {
        rotation_angle_z: 360,
        transition: "linear",
        time: 5,
        onComplete: () => {
            icon.rotation_angle_z = 0
            addTween(icon, tweenParams)
        }, 
    }

    return {
        stopRotation: () => {
            removeTweens(icon)
            icon.rotation_angle_z = 0
        },
        startResumeRotation: () =>  addTween(icon, tweenParams)

    }

}