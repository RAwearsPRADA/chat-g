import type { ObjectValue } from "./types/ObjectsArray.types"


export class ObjectsArray<T extends Record<string, ObjectValue>> {
    private kit: Array<T> = []
    private uniqueKeys: Set<keyof T>
    constructor(uniqueKeys: string[] | string) {
        this.uniqueKeys = new Set<string>()
        if (typeof uniqueKeys === 'string')
            this.uniqueKeys.add(uniqueKeys)
        else {
            uniqueKeys.forEach(key => {
                this.uniqueKeys.add(key)
            })
        }
    }
    private checkUniqueness(item: T): boolean {
        for (const key of this.uniqueKeys) {
            if (!(key in item))
                return false
        }
        for (const element of this.kit) {
            for (const key of this.uniqueKeys) {
                if (element[key] === item[key])
                    return false
            }
        }
        return true
    }
    public add(item: T): boolean {
        if (this.checkUniqueness(item)) {
            this.kit.push(item)
            return true
        }
        return false
    }
    public delete(field: keyof T, value: T[keyof T]): boolean {
        for (let i = 0; i < this.kit.length; i++) {
            if (this.kit[i][field] === value) {
                this.kit[i] = this.kit[this.kit.length - 1]
                this.kit = this.kit.slice(0, this.kit.length - 1)
                return true
            }
        }
        return false

    }
    public deleteByObject(item: Partial<T>) {
        const itemKey = Object.keys(item)[0]
        const itemValue = item[itemKey]
        for (let i = 0; i < this.kit.length; i++) {
            if (this.kit[i][itemKey] === itemValue) {
                this.kit[i] = this.kit[this.kit.length - 1]
                this.kit = this.kit.slice(0, this.kit.length - 1)
            }
        }
    }
    public changeItemState(item: T, field: keyof T, value: T[keyof T]) {
        this.kit.map(user =>{
            if (user[field] === item[field])
                return user[field] = value
            return user
            })
    }
    public getObjects() {
        return this.kit
    }

}
