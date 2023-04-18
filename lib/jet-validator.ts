/**
 * Core library folder.
 */

import { Request, Response, NextFunction, RequestHandler } from 'express';


// **** Variables **** //

export const ERR_MSG = 'The following parameter was missing or invalid: ';


// **** Types **** //

export type TValidatorFn =  (arg: unknown) => boolean;
type TLoopFn = (req: Request) => boolean;
type TReqObjProps = 'body' | 'query' | 'params';

type TParamArr = {
  0: string,
  1?: string | TValidatorFn,
  2?: TReqObjProps,
}

interface IParamFields {
  paramName: string; 
  type: string; 
  reqObjProp: TReqObjProps;
}

interface ILoopItem {
  paramName: string;
  fn: TLoopFn;
}


// **** Functions **** //

/**
 * Entry point. Returns validate middleware function.
 */
function jetValidator(errCode?: number) {
  return (...params: Array<string | TParamArr>): RequestHandler => {
    // Return middlware function
    const itemArr: ILoopItem[] = getLoopFns(params);
    return (req: Request, res: Response, next: NextFunction) => {
      for (const item of itemArr) {
        if (!item.fn(req)) {
          const error = ERR_MSG + `"${item.paramName}".`;
          return res.status(errCode ?? 400).json({ error });
        }
      }
      return next();
    };
  };
}

/**
 * See comments at beginning of file on usage.
 */
function getLoopFns(params: Array<string | TParamArr>): ILoopItem[] {
  // Setup loop-function array
  const retVal: ILoopItem[] = [];
  for (const param of params) {
    const { paramName, type, reqObjProp } = getParamFields(param);
    let loopFn: TLoopFn = () => false;
    if (type === 'string') {
      loopFn = checkStr(reqObjProp, paramName);
    } else if (type === 'number') {
      loopFn = checkNum(reqObjProp, paramName);
    } else if (type === 'boolean') {
      loopFn = checkBool(reqObjProp, paramName);
    } else if (type === 'function') {
      const fn = param[1] as TValidatorFn;
      loopFn = checkValidatorFn(reqObjProp, paramName, fn);
    } else {
      loopFn = checkDefault(reqObjProp, paramName, type);
    }
    retVal.push({
      paramName,
      fn: loopFn,
    });
  }
  // Return
  return retVal;
}

/**
* Get the param name, type to check against, and the request object property
* as well as validating the format of the param.
*/
function getParamFields(param: string | TParamArr): IParamFields {
  let paramName = '';
  let type = 'string';
  let reqObjProp: TReqObjProps = 'body';
  // Param is string
  if (typeof param === 'string') {
    paramName = param;
  // Param is array
  } else if (param instanceof Array) {
    // Get the param name
    paramName = param[0];
    if (typeof paramName !== 'string') {
      throw Error('param name must be a string');
    }
    // Get the type
    if (param.length > 1) {
      if (typeof param[1] === 'string') {
        type = param[1];
      } else if (typeof param[1] === 'function') {
        type = 'function';
      } else {
        throw Error('param[1] must be a string or a validator function');
      }
    }
    // Get the request object property
    const prop = (param.length >= 3 ? param[2] : 'body');
    if (prop !== 'body' && prop !== 'params' && prop !== 'query') {
      throw Error('param[2] must be "body", "query", or "params"');
    } else {
      reqObjProp = prop;
    }
  // Throw error if not string or array
  } else {
    throw Error('"validate()" argument must be a string or array');
  }
  // Return
  return { paramName, type, reqObjProp };
}

/**
* Check param is a valid string.
*/
function checkStr(reqObjProp: TReqObjProps, paramName: string): TLoopFn {
  return getLoopFn(reqObjProp, paramName, (toCheck) => {
    return (typeof toCheck === 'string');
  });
}

/**
* Check param is a valid number. See notes at beginning of file.
*/
function checkNum(reqObjProp: TReqObjProps, paramName: string): TLoopFn {
  return getLoopFn(reqObjProp, paramName, (toCheck) => {
    if (reqObjProp === 'query' || reqObjProp === 'params') {
      return !isNaN(toCheck as number);
    } else if (reqObjProp === 'body' && typeof toCheck !== 'number') {
      return false;
    } else {
      return true;
    }
  });
}

/**
* Check param is a valid boolean. See notes at beginning of file.
*/
function checkBool(reqObjProp: TReqObjProps, paramName: string): TLoopFn {
  return getLoopFn(reqObjProp, paramName, (toCheck) => {
    if (reqObjProp === 'query' || reqObjProp === 'params') {
      return isBool(toCheck as boolean);
    } else if (reqObjProp === 'body' && typeof toCheck !== 'boolean') {
      return false;
    } else {
      return true;
    }
  });
}

/**
* Checks if arg is a boolean, or a string that is 'true', or 'false'.
*/
function isBool(arg: string | boolean): boolean {
  if (typeof arg === 'boolean') {
    return true;
  } else if (typeof arg === 'string') {
    arg = arg.toLowerCase();
    return (arg === 'true' || arg === 'false');
  } else {
    return false;
  }
}

/**
* Make sure the parameter satifies the supplied validator function.
*/
function checkValidatorFn(
  reqObjProp: TReqObjProps,
  paramName: string,
  validatorFn: TValidatorFn,
) {
  return getLoopFn(reqObjProp, paramName, (toCheck) => {
    return validatorFn(toCheck);
  });
}

/**
* For all other type make sure the param equals the type.
*/
function checkDefault(
  reqObjProp: TReqObjProps,
  paramName: string,
  type: string,
): TLoopFn {
  return getLoopFn(reqObjProp, paramName, (toCheck) => {
    return (typeof toCheck === type);
  });
}

/**
* Extract the value to check and get the loop function.
*/
function getLoopFn(
  reqObjProp: TReqObjProps,
  paramName: string,
  cb: (toCheck: unknown) => boolean,
): TLoopFn {
  return (req: Request) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const toCheck = req[reqObjProp][paramName] as unknown;
    return cb(toCheck);
  };
}


// **** Export Default **** //

export default jetValidator;
