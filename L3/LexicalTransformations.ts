import { ClassExp, ProcExp, Exp, Program, CExp, Binding, makeIfExp, makeAppExp, makePrimOp, makeVarDecl, makeVarRef, makeBoolExp, makeLitExp, makeProcExp, isNumExp, isBoolExp, isStrExp, isPrimOp, isVarRef, isLitExp, isIfExp, isProcExp, isClassExp, isAppExp, isLetExp, isAtomicExp } from "./L3-ast";
import { Result, makeFailure, makeOk } from "../shared/result";
import { reduce } from "ramda";
import { makeSymbolSExp } from "./L3-value";
import { applyEnv } from "./L3-env-env";

/*
Purpose: Transform ClassExp to ProcExp
Signature: class2proc(classExp)
Type: ClassExp => ProcExp
*/
export const class2proc = (exp: ClassExp): ProcExp => 
    makeProcExp(exp.fields, [makeProcExp([makeVarDecl("msg")],
            [reduce
                (
                (acc: CExp, b: Binding) => makeIfExp(makeAppExp(makePrimOp("eq?"), [makeVarRef("msg"), makeLitExp(b.var.var)]), b.val, acc),
                makeBoolExp(false),
                exp.methods
                )
            ])])
    


/*
Purpose: Transform all class forms in the given AST to procs
Signature: lexTransform(AST)
Type: [Exp | Program] => Result<Exp | Program>
*/

export const lexTransform = (exp: Exp | Program): Result<Exp | Program> =>
    isAtomicExp(exp) ? makeOk(exp):
    isIfExp(exp) ? makeOk(makeIfExp(lexTransform(exp.test), lexTransform(exp.then), lexTransform(exp.alt))) : // yoter moohar
    isProcExp(exp) ? evalProc(exp, env) :
    isClassExp(exp) ? evalClass(exp, env) : 
    isAppExp(exp) ? bind(L3applicativeEval(exp.rator, env), (rator: Value) =>
                        bind(mapResult(param => 
                            L3applicativeEval(param, env), 
                              exp.rands), 
                            (rands: Value[]) =>
                                L3applyProcedure(rator, rands, env))) :
    isLetExp(exp) ? makeFailure('"let" not supported (yet)') :
    makeFailure('Never');
