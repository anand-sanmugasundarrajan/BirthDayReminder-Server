class CustomValidator {
    static register(parent){
        var name = this._name = this.name.replace(/([a-zA-Z0-9])(Validator)$/g, '$1');
        parent.validator[name] = this;
        if(parent.validator.triggerEvent){
            parent.validator.triggerEvent("add", name, this);
        }
    }
    // super(args){
    //     if(args && args.length){
    //         var name = args[args.length-1]
    //         this.prototype[name].apply(this.prototype, args);
    //     }
    // }
}

export { CustomValidator };