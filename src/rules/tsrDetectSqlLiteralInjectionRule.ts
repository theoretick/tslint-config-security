import * as Lint from 'tslint';
import * as ts from 'typescript';
import {isSqlQuery} from '../is-sql-query';
import {stringLiteralKinds} from '../node-kind';

export class Rule extends Lint.Rules.AbstractRule {
    apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithWalker(new RuleWalker(sourceFile, this.getOptions()));
    }
}

const generalErrorMessage: string = 'Found possible SQL injection';

class RuleWalker extends Lint.RuleWalker {
    visitTemplateExpression(node: ts.TemplateExpression) {
        const {parent} = node;

        if (
            (!parent || parent.kind !== ts.SyntaxKind.TaggedTemplateExpression) &&
            isSqlQuery(node.getText().slice(1, -1))
        ) {
            this.addFailureAtNode(node, generalErrorMessage);
        }

        super.visitTemplateExpression(node);
    }

    visitBinaryExpression(node: ts.BinaryExpression) {
        const {left} = node;

        if (left && stringLiteralKinds.includes(left.kind) && isSqlQuery(left.getText().slice(1, -1))) {
            this.addFailureAtNode(left, generalErrorMessage);
        }

        super.visitBinaryExpression(node);
    }
}
