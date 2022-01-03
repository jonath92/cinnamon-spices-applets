// the visible prop from clutter actor always returns true when not implicity set to false. But when the parent is not visible, the actor is actually also not visible
export function checkActorTrulyVisible(actor: imports.gi.Clutter.Actor): boolean {

    const parent = actor.get_parent()

    if (!actor.visible) return false
    if (!parent) return true

    return checkActorTrulyVisible(parent)
}