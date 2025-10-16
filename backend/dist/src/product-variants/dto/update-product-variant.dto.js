"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateProductVariantDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_product_variant_dto_1 = require("./create-product-variant.dto");
class UpdateProductVariantDto extends (0, swagger_1.PartialType)(create_product_variant_dto_1.CreateProductVariantDto) {
}
exports.UpdateProductVariantDto = UpdateProductVariantDto;
//# sourceMappingURL=update-product-variant.dto.js.map