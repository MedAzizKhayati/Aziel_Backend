import { SelectQueryBuilder } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';


export const ONE_DAY = 1000 * 60 * 60 * 24;
export const getTomorrowsDateSQL = () => 
    new Date(+new Date() + ONE_DAY).toISOString().slice(0, 19).replace('T', ' ');

// This function gets a string and capitializes each word in the string. (Ex. "hello world" => "Hello World")
export const capitalizeWords = (str: string) => {
    const arr = str.split(' ');
    const newArr = arr.map(element => {
        return element.charAt(0).toUpperCase() + element.substring(1).toLowerCase();
    });
    return newArr.join(' ');
}

// This function generates a unique name for a given file.
export const editFileName = (req, file, callback) => {
    const randomName = uuidv4() + '-' + file.originalname;
    callback(null, randomName);
}

// This function filters out files that are not images.
export const imageFileFilter = (req, file, callback) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return callback(new Error('Only image files are allowed!'), false);
    }
    callback(null, true);
}

export function round(value: number, precision: number = 1) {
    var multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
}

export function paginate(
    qb: SelectQueryBuilder<any>,
    page?: number,
    number?: number,
) {
    console.log('i am paginating', page, number);

    if (number) {
        if (!page) page = 1;
        qb.skip((page - 1) * number);
        qb.take(number);
    }
}