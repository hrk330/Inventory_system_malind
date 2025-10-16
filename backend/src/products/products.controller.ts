import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, UseInterceptors, UploadedFile, Res, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from '../config/multer.config';
import { Response } from 'express';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { BulkCreateProductDto } from './dto/bulk-create-product.dto';
import { BulkUpdateProductDto } from './dto/bulk-update-product.dto';
import { BulkDeleteProductDto } from './dto/bulk-delete-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Products')
@Controller('products')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Product with this SKU already exists' })
  create(@Body() createProductDto: CreateProductDto, @Req() req: any) {
    const userId = req.user?.id;
    return this.productsService.create(createProductDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products' })
  @ApiResponse({ status: 200, description: 'Products retrieved successfully' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by name or SKU' })
  @ApiQuery({ name: 'category', required: false, description: 'Filter by category' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status (active, inactive, or all)', enum: ['active', 'inactive', 'all'] })
  findAll(@Query('search') search?: string, @Query('category') category?: string, @Query('status') status?: string) {
    return this.productsService.findAll(search, category, status);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get all product categories' })
  @ApiResponse({ status: 200, description: 'Categories retrieved successfully' })
  getCategories() {
    return this.productsService.getCategories();
  }

  @Post('categories')
  @ApiOperation({ summary: 'Create a new category' })
  @ApiResponse({ status: 201, description: 'Category created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Category already exists' })
  createCategory(@Body() body: { name: string }) {
    return this.productsService.createCategory(body.name);
  }

  @Patch('categories/:oldName')
  @ApiOperation({ summary: 'Update category name' })
  @ApiResponse({ status: 200, description: 'Category updated successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiResponse({ status: 409, description: 'New category name already exists' })
  updateCategory(@Param('oldName') oldName: string, @Body() body: { newName: string }) {
    return this.productsService.updateCategory(oldName, body.newName);
  }

  @Delete('categories/:name')
  @ApiOperation({ summary: 'Delete category' })
  @ApiResponse({ status: 200, description: 'Category deleted successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  deleteCategory(@Param('name') name: string) {
    return this.productsService.deleteCategory(name);
  }

  @Get('uoms')
  @ApiOperation({ summary: 'Get all units of measure' })
  @ApiResponse({ status: 200, description: 'UOMs retrieved successfully' })
  getUOMs() {
    return this.productsService.getUOMs();
  }

  @Get('deleted')
  @ApiOperation({ summary: 'Get all deleted products' })
  @ApiResponse({ status: 200, description: 'Deleted products retrieved successfully' })
  getDeletedProducts() {
    return this.productsService.getDeletedProducts();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiResponse({ status: 200, description: 'Product retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update product' })
  @ApiResponse({ status: 200, description: 'Product updated successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 409, description: 'Product with this SKU already exists' })
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto, @Req() req: any) {
    const userId = req.user?.id;
    return this.productsService.update(id, updateProductDto, userId);
  }

  @Delete('bulk')
  @ApiOperation({ summary: 'Bulk delete products' })
  @ApiResponse({ status: 200, description: 'Products deleted successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Some products cannot be deleted' })
  bulkDelete(@Body() bulkDeleteDto: BulkDeleteProductDto) {
    return this.productsService.bulkDelete(bulkDeleteDto.ids);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete product' })
  @ApiResponse({ status: 200, description: 'Product deleted successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 409, description: 'Cannot delete product with existing stock' })
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restore deleted product' })
  @ApiResponse({ status: 200, description: 'Product restored successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 409, description: 'Product is not deleted' })
  restoreProduct(@Param('id') id: string) {
    return this.productsService.restoreProduct(id);
  }

  @Delete('bulk/permanent')
  @ApiOperation({ summary: 'Bulk permanently delete products' })
  @ApiResponse({ status: 200, description: 'Products permanently deleted successfully' })
  @ApiResponse({ status: 400, description: 'No products selected' })
  @ApiResponse({ status: 404, description: 'Some products not found' })
  @ApiResponse({ status: 409, description: 'Cannot permanently delete products with existing stock' })
  bulkPermanentDelete(@Body() body: { ids: string[] }) {
    return this.productsService.bulkPermanentDelete(body.ids);
  }

  @Delete(':id/permanent')
  @ApiOperation({ summary: 'Permanently delete product' })
  @ApiResponse({ status: 200, description: 'Product permanently deleted' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 409, description: 'Cannot permanently delete product with existing stock' })
  permanentDelete(@Param('id') id: string) {
    return this.productsService.permanentDelete(id);
  }

  @Get('bulk-import/template')
  @ApiOperation({ summary: 'Download bulk import template' })
  @ApiResponse({ status: 200, description: 'Template file downloaded' })
  async downloadTemplate(@Res() res: Response) {
    const template = await this.productsService.downloadTemplate();
    
    res.setHeader('Content-Type', template.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${template.filename}"`);
    res.send(template.content);
  }

  @Post('bulk-import/preview')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Preview bulk import data' })
  @ApiResponse({ status: 200, description: 'Preview data generated' })
  @ApiResponse({ status: 400, description: 'Invalid file format' })
  previewBulkImport(@UploadedFile() file: Express.Multer.File) {
    return this.productsService.previewBulkImport(file);
  }

  @Post('bulk-import')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Bulk import products' })
  @ApiResponse({ status: 200, description: 'Products imported successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file format' })
  bulkImport(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
    const userId = req.user?.id;
    return this.productsService.bulkImport(file, userId);
  }

  @Get('barcode/:barcode')
  @ApiOperation({ summary: 'Find product by barcode' })
  @ApiResponse({ status: 200, description: 'Product found' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  findByBarcode(@Param('barcode') barcode: string) {
    return this.productsService.findByBarcode(barcode);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Bulk create products' })
  @ApiResponse({ status: 201, description: 'Products created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Some products already exist' })
  bulkCreate(@Body() bulkCreateDto: BulkCreateProductDto) {
    return this.productsService.bulkCreate(bulkCreateDto.products);
  }

  @Patch('bulk')
  @ApiOperation({ summary: 'Bulk update products' })
  @ApiResponse({ status: 200, description: 'Products updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  bulkUpdate(@Body() bulkUpdateDto: BulkUpdateProductDto) {
    return this.productsService.bulkUpdate(bulkUpdateDto.updates);
  }

  @Patch(':id/toggle-active')
  @ApiOperation({ summary: 'Toggle product active status' })
  @ApiResponse({ status: 200, description: 'Product status toggled successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  toggleActive(@Param('id') id: string) {
    return this.productsService.toggleActive(id);
  }

  @Get('performance/analytics')
  @ApiOperation({ summary: 'Get product performance analytics' })
  @ApiResponse({ status: 200, description: 'Performance data retrieved successfully' })
  @ApiQuery({ name: 'category', required: false, description: 'Filter by category' })
  @ApiQuery({ name: 'supplierId', required: false, description: 'Filter by supplier ID' })
  getPerformance(@Query('category') category?: string, @Query('supplierId') supplierId?: string) {
    return this.productsService.getProductPerformance({ category, supplierId });
  }
}
