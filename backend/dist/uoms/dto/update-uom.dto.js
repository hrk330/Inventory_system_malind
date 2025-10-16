"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateUOMDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_uom_dto_1 = require("./create-uom.dto");
class UpdateUOMDto extends (0, swagger_1.PartialType)(create_uom_dto_1.CreateUOMDto) {
}
exports.UpdateUOMDto = UpdateUOMDto;
//# sourceMappingURL=update-uom.dto.js.map