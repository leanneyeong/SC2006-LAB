export interface UserProps {
    id: string;
    email: string;
    firstName: string,
    lastName: string;
    isDarkMode: boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
}

export class User{
    constructor(private readonly props: Readonly<UserProps>){}

    public getValue(): UserProps{
        return this.props;
    }

    public delete(): User{
        return new User({
            ...this.props,
            deletedAt: new Date()
        });
    }

    public setNames(firstName: string,lastName: string): User {
        return new User({
            ...this.props,
            firstName,
            lastName
        });
    }

    public setMainSettings(isDarkMode: boolean) {
        return new User({
            ...this.props,
            isDarkMode
        })
    }
}