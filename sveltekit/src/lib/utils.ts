import type { UiNodeAttributes, UiNodeInputAttributes } from "@ory/kratos-client";

export const isUiNodeInputAttributes = (
	attributes: UiNodeAttributes
): attributes is UiNodeInputAttributes => {
	return (attributes as UiNodeInputAttributes).node_type === 'input';
};