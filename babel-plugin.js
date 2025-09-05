// Babel plugin to automatically wrap elements with testID in Measurable component
module.exports = function (babel) {
  const {types: t} = babel;

  return {
    name: "appstorys-react-native",
    visitor: {
      Program: {
        enter(path) {
          // Track if we've already added the import to prevent duplicates
          path.node._measurableImportAdded = false;
        }
      },
      JSXElement(path) {
        const openingElement = path.node.openingElement;

        // Skip if this is already a Measurable element to prevent infinite recursion
        if (
          t.isJSXIdentifier(openingElement.name) &&
          openingElement.name.name === 'Measurable'
        ) {
          return;
        }

        // Check if this element has a testID prop
        const testIDAttribute = openingElement.attributes.find(
          attr =>
            t.isJSXAttribute(attr) &&
            t.isJSXIdentifier(attr.name) &&
            attr.name.name === 'testID'
        );

        if (!testIDAttribute) {
          return; // No testID, skip this element
        }

        // Check if parent is already Measurable to prevent double wrapping
        const parent = path.parent;
        if (
          t.isJSXElement(parent) &&
          t.isJSXIdentifier(parent.openingElement.name) &&
          parent.openingElement.name.name === 'Measurable'
        ) {
          return; // Already wrapped, skip
        }

        // Get the testID value
        const testIDValue = testIDAttribute.value;

        // Remove testID from the original element
        openingElement.attributes = openingElement.attributes.filter(
          attr => !(
            t.isJSXAttribute(attr) &&
            t.isJSXIdentifier(attr.name) &&
            attr.name.name === 'testID'
          )
        );

        // Create the Measurable wrapper
        const measurableElement = t.jsxElement(
          t.jsxOpeningElement(
            t.jsxIdentifier('Measurable'),
            [
              t.jsxAttribute(
                t.jsxIdentifier('testID'),
                testIDValue
              )
            ]
          ),
          t.jsxClosingElement(t.jsxIdentifier('Measurable')),
          [path.node],
          false
        );

        // Add import for Measurable if not already present
        const program = path.findParent(path => path.isProgram());

        if (!program.node._measurableImportAdded) {
          const imports = program.node.body.filter(node => t.isImportDeclaration(node));

          const hasMeasurableImport = imports.some(importNode =>
            importNode.source.value.includes('Measurable') ||
            importNode.specifiers.some(spec =>
              t.isImportSpecifier(spec) && spec.imported.name === 'Measurable'
            )
          );

          if (!hasMeasurableImport) {
            const importDeclaration = t.importDeclaration(
              [t.importSpecifier(t.identifier('Measurable'), t.identifier('Measurable'))],
              t.stringLiteral('@appstorys/appstorys-react-native')
            );
            program.unshiftContainer('body', importDeclaration);
            program.node._measurableImportAdded = true;
          }
        }

        // Replace the element with the wrapped version
        path.replaceWith(measurableElement);

        // Continue traversing the children of the wrapped element
        // This ensures nested elements with testID also get transformed
        path.traverse({
          JSXElement(childPath) {
            // Only process direct children, not nested Measurable elements
            if (childPath.parent === measurableElement) {
              return;
            }

            const childOpeningElement = childPath.node.openingElement;

            // Skip if this is already a Measurable element
            if (
              t.isJSXIdentifier(childOpeningElement.name) &&
              childOpeningElement.name.name === 'Measurable'
            ) {
              return;
            }

            // Check if this child element has a testID prop
            const childTestIDAttribute = childOpeningElement.attributes.find(
              attr =>
                t.isJSXAttribute(attr) &&
                t.isJSXIdentifier(attr.name) &&
                attr.name.name === 'testID'
            );

            if (childTestIDAttribute) {
              // Get the testID value
              const childTestIDValue = childTestIDAttribute.value;

              // Remove testID from the original child element
              childOpeningElement.attributes = childOpeningElement.attributes.filter(
                attr => !(
                  t.isJSXAttribute(attr) &&
                  t.isJSXIdentifier(attr.name) &&
                  attr.name.name === 'testID'
                )
              );

              // Create the Measurable wrapper for the child
              const childMeasurableElement = t.jsxElement(
                t.jsxOpeningElement(
                  t.jsxIdentifier('Measurable'),
                  [
                    t.jsxAttribute(
                      t.jsxIdentifier('testID'),
                      childTestIDValue
                    )
                  ]
                ),
                t.jsxClosingElement(t.jsxIdentifier('Measurable')),
                [childPath.node],
                false
              );

              // Replace the child element with the wrapped version
              childPath.replaceWith(childMeasurableElement);
            }
          }
        });
      }
    }
  };
};
