// ... (todas as importações e estado permanecem iguais até o return)

return (
  <div className="min-h-screen bg-gray-50 py-40">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Botão Voltar */}
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center text-black mb-6 hover:text-red-600 transition-colors"
        style={{ fontFamily: "'Calibri', 'sans-serif'" }}
      >
        <IoIosArrowRoundBack size={24} className="mr-2" />
        Voltar para Produtos
      </button>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
          {/* Imagens do Produto */}
          <div className="space-y-4">
            {/* Imagem Principal */}
            <div className="bg-gray-100 rounded-xl overflow-hidden h-auto">
              <img 
                src={mainImage} 
                alt={product.title}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Galeria de Imagens */}
            {imageGallery.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {imageGallery.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setMainImage(img)}
                    className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 ${
                      mainImage === img ? 'border-red-600' : 'border-transparent'
                    }`}
                  >
                    <img 
                      src={img} 
                      alt={`${product.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Informações do Produto */}
          <div className="space-y-6">
            {/* Título e Avaliações - MESMA LINHA */}
            <div className="flex items-center justify-between gap-4">
              {/* Título com Calibri */}
              <h1 
                className="text-3xl font-bold text-black flex-1"
                style={{ fontFamily: "'Calibri', 'sans-serif'" }}
              >
                {product.title}
              </h1>

              {/* Sistema de Estrelas - TUDO NA MESMA LINHA COM CALIBRI */}
              <div className="flex items-center space-x-3" style={{ fontFamily: "'Calibri', 'sans-serif'" }}>
                {/* Estrelas */}
                <div className="flex items-center">
                  {renderStars(rating.average)}
                </div>
                
                {/* Número da avaliação e quantidade - MESMA LINHA COM CALIBRI */}
                <div className="flex items-center space-x-2">
                  <span className="text-gray-800 font-bold text-lg">
                    {rating.average.toFixed(1)}
                  </span>
                  <span className="text-gray-400 text-lg">|</span>
                  <span className="text-gray-500 text-sm">
                    {rating.count} avaliações
                  </span>
                </div>
              </div>
            </div>

            {/* Preços COM CALIBRI */}
            <div className="flex items-center space-x-4" style={{ fontFamily: "'Calibri', 'sans-serif'" }}>
              <p className="text-3xl font-bold text-black">
                ${product.price}
              </p>
              <p className="text-xl font-semibold text-gray-500 line-through">
                ${Math.floor(parseFloat(product.price) + parseFloat(product.price) * 0.4968 + 0.20)}.99
              </p>
              <span className="bg-red-100 text-red-600 px-2 py-1 rounded-md text-sm font-semibold">
                -33%
              </span>
            </div>

            {/* Categoria COM CALIBRI */}
            <div className="flex items-center space-x-4" style={{ fontFamily: "'Calibri', 'sans-serif'" }}>
              <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                {product.category}
              </span>
              <span className="text-green-600 font-semibold">
                {product.stock > 0 ? 'Em Stock' : 'Fora de Stock'}
              </span>
            </div>

            {/* Descrição COM CALIBRI */}
            <p className="text-gray-700 text-lg leading-relaxed" style={{ fontFamily: "'Calibri', 'sans-serif'" }}>
              {product.description}
            </p>

            {/* Seleção de Tamanho - COM GEORGIA (mantido do original) */}
            <div>
              <label 
                className="block text-lg font-semibold text-black mb-3"
                style={{ fontFamily: "'Georgia', 'Times New Roman', 'Palatino', serif" }}
              >
                Tamanho
              </label>
              <div className="flex flex-wrap gap-3">
                {product.size.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-14 h-14 flex items-center justify-center border-2 rounded-lg font-bold text-lg transition-all duration-200 ${
                      selectedSize === size
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-black border-gray-300 hover:border-black'
                    }`}
                    style={{ fontFamily: "'Georgia', 'Times New Roman', 'Palatino', serif" }}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Seleção de Cor - COM GEORGIA (mantido do original) */}
            <div>
              <label 
                className="block text-lg font-semibold text-black mb-3"
                style={{ fontFamily: "'Georgia', 'Times New Roman', 'Palatino', serif" }}
              >
                Cor
              </label>
              <div className="flex flex-wrap gap-3">
                {product.color.map((color, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedColor(color)}
                    className={`w-12 h-12 rounded-full border-2 transition-all duration-200 ${
                      selectedColor === color
                        ? 'border-black ring-2 ring-offset-2 ring-black'
                        : 'border-gray-300 hover:scale-110'
                    } ${
                      color === "#FFFFFF" ? 'border-gray-300' : ''
                    }`}
                    style={{ backgroundColor: color }}
                    title={getColorName(color)}
                  />
                ))}
              </div>
              {selectedColor && (
                <p className="text-sm text-gray-600 mt-2" style={{ fontFamily: "'Calibri', 'sans-serif'" }}>
                  Cor selecionada: {getColorName(selectedColor)}
                </p>
              )}
            </div>

            {/* Seletor de Quantidade - COM GEORGIA (mantido do original) */}
            <div>
              <label 
                className="block text-lg font-semibold text-black mb-3"
                style={{ fontFamily: "'Georgia', 'Times New Roman', 'Palatino', serif" }}
              >
                Quantidade
              </label>
              <div className="flex items-center space-x-4">
                <div className="flex items-center border-2 border-gray-300 rounded-lg">
                  <button
                    onClick={decreaseQuantity}
                    disabled={quantity <= 1}
                    className={`w-12 h-12 flex items-center justify-center text-xl font-bold transition-colors ${
                      quantity <= 1 
                        ? 'text-gray-400 cursor-not-allowed' 
                        : 'hover:bg-gray-100 text-black'
                    }`}
                    style={{ fontFamily: "'Calibri', 'sans-serif'" }}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={product.stock}
                    value={quantity}
                    onChange={handleQuantityChange}
                    className="w-12 h-12 flex items-center justify-center text-lg font-semibold text-center border-0 focus:outline-none focus:ring-0 text-black"
                    style={{ fontFamily: "'Calibri', 'sans-serif'" }}
                  />
                  <button
                    onClick={increaseQuantity}
                    disabled={quantity >= product.stock}
                    className={`w-12 h-12 flex items-center justify-center text-xl font-bold transition-colors ${
                      quantity >= product.stock
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'hover:bg-gray-100 text-black'
                    }`}
                    style={{ fontFamily: "'Calibri', 'sans-serif'" }}
                  >
                    +
                  </button>
                </div>
                <span className="text-gray-600" style={{ fontFamily: "'Calibri', 'sans-serif'" }}>
                  {product.stock} disponíveis
                </span>
              </div>
              {quantity >= product.stock && (
                <p className="text-red-500 text-sm mt-2" style={{ fontFamily: "'Calibri', 'sans-serif'" }}>
                  Quantidade máxima atingida
                </p>
              )}
            </div>

            {/* Botões de Ação - COM GEORGIA (mantido do original) */}
            <div className="flex space-x-4 pt-4">
              <button
                onClick={addToCart}
                disabled={product.stock === 0 || addingToCart}
                className={`flex-1 py-4 px-6 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center ${
                  product.stock === 0 || addingToCart
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
                style={{ fontFamily: "'Georgia', 'Times New Roman', 'Palatino', serif" }}
              >
                {addingToCart ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Adicionando...
                  </>
                ) : (
                  <>
                    <FiShoppingCart className="mr-3" size={25} />
                    {product.stock === 0 ? 'Fora de Stock' : ''}
                  </>
                )}
              </button>
              <button
                onClick={() => setFavorite(!favorite)}
                className="w-14 h-14 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:border-red-600 transition-colors"
              >
                <FiHeart 
                  size={24} 
                  style={{ 
                    stroke: favorite ? "red" : "black", 
                    strokeWidth: 1.5, 
                    fill: favorite ? "red" : "none" 
                  }} 
                />
              </button>
              <button className="w-14 h-14 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:border-red-600 transition-colors">
                <FiShare2 size={24} style={{ stroke: "black", strokeWidth: 1.5 }} />
              </button>
            </div>

            {/* Informações Adicionais COM CALIBRI */}
            <div className="border-t border-gray-200 pt-6">
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600" style={{ fontFamily: "'Calibri', 'sans-serif'" }}>
                <div>
                  <span className="font-semibold">Categoria:</span> {product.category}
                </div>
                <div>
                  <span className="font-semibold">SKU:</span> {product.sku}
                </div>
                <div>
                  <span className="font-semibold">Material:</span> {product.material}
                </div>
                <div>
                  <span className="font-semibold">Origem:</span> {product.origin}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Abas do Produto */}
        <div className="border-t border-gray-200 mt-8">
          <div className="flex border-b border-gray-200">
            {['description', 'reviews', 'specifications', 'shipping'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 px-6 text-lg font-semibold text-center capitalize transition-colors ${
                  activeTab === tab
                    ? 'text-red-600 border-b-2 border-red-600'
                    : 'text-gray-600 hover:text-red-600'
                }`}
                style={{ fontFamily: "'Calibri', 'sans-serif'" }}
              >
                {tab === 'description' ? 'descrição' : 
                 tab === 'reviews' ? 'avaliações' :
                 tab === 'specifications' ? 'especificações' : 'envio'}
              </button>
            ))}
          </div>

          <div className="p-8">
            {activeTab === 'description' && (
              <div className="prose max-w-none">
                <h3 className="text-2xl font-bold text-black mb-4" style={{ fontFamily: "'Calibri', 'sans-serif'" }}>
                  Descrição do Produto
                </h3>
                <p className="text-gray-700 leading-relaxed" style={{ fontFamily: "'Calibri', 'sans-serif'" }}>
                  {product.description}
                </p>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-black mb-4" style={{ fontFamily: "'Calibri', 'sans-serif'" }}>
                  Avaliações dos Clientes
                </h3>
                
                {/* Resumo das avaliações COM CALIBRI */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <div className="flex flex-col items-center mb-4" style={{ fontFamily: "'Calibri', 'sans-serif'" }}>
                      <div className="text-5xl font-bold text-black mb-2">
                        {rating.average.toFixed(1)}
                      </div>
                      <div className="flex mb-2">
                        {renderStars(rating.average)}
                      </div>
                      <p className="text-gray-600">
                        {rating.count} avaliações
                      </p>
                    </div>
                  </div>
                  
                  {/* Distribuição de estrelas COM CALIBRI */}
                  <div className="space-y-3" style={{ fontFamily: "'Calibri', 'sans-serif'" }}>
                    {[5, 4, 3, 2, 1].map((stars) => {
                      const count = rating.distribution[stars - 1];
                      const percentage = calculatePercentage(count, rating.count);
                      
                      return (
                        <div key={stars} className="flex items-center">
                          <div className="w-20 flex items-center">
                            <span className="text-gray-700 mr-2">{stars}</span>
                            <FaStar className="text-yellow-500" />
                          </div>
                          <div className="flex-1 mx-4">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-yellow-500 h-2 rounded-full"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                          <div className="w-12 text-right text-gray-700">
                            {percentage}%
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {/* Exemplo de avaliações (simuladas) COM CALIBRI */}
                <div className="mt-8">
                  <h4 className="text-xl font-semibold text-black mb-4" style={{ fontFamily: "'Calibri', 'sans-serif'" }}>
                    Avaliações recentes
                  </h4>
                  <div className="space-y-6" style={{ fontFamily: "'Calibri', 'sans-serif'" }}>
                    {/* Avaliação 1 */}
                    <div className="border-b border-gray-200 pb-4">
                      <div className="flex items-center mb-2">
                        <div className="flex mr-2">
                          {renderStars(5)}
                        </div>
                        <span className="font-semibold">Excelente produto!</span>
                      </div>
                      <p className="text-gray-700 mb-2">
                        "Qualidade excepcional e confortável. Superou minhas expectativas!"
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>João Silva</span>
                        <span>15 de Janeiro, 2024</span>
                      </div>
                    </div>
                    
                    {/* Avaliação 2 */}
                    <div className="border-b border-gray-200 pb-4">
                      <div className="flex items-center mb-2">
                        <div className="flex mr-2">
                          {renderStars(4)}
                        </div>
                        <span className="font-semibold">Muito bom</span>
                      </div>
                      <p className="text-gray-700 mb-2">
                        "Gostei muito, mas poderia ter mais cores disponíveis."
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>Maria Santos</span>
                        <span>10 de Janeiro, 2024</span>
                      </div>
                    </div>
                    
                    {/* Avaliação 3 */}
                    <div className="border-b border-gray-200 pb-4">
                      <div className="flex items-center mb-2">
                        <div className="flex mr-2">
                          {renderStars(5)}
                        </div>
                        <span className="font-semibold">Perfeito!</span>
                      </div>
                      <p className="text-gray-700 mb-2">
                        "Exatamente como na foto. Entrega rápida e produto de alta qualidade."
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>Carlos Oliveira</span>
                        <span>5 de Janeiro, 2024</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{ fontFamily: "'Calibri', 'sans-serif'" }}>
                <div>
                  <h4 className="text-lg font-semibold text-black mb-3">Detalhes do Produto</h4>
                  <dl className="space-y-2">
                    <div className="flex justify-between border-b border-gray-100 py-2">
                      <dt className="text-gray-600">Material</dt>
                      <dd className="text-black">{product.material}</dd>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 py-2">
                      <dt className="text-gray-600">Instruções de Cuidado</dt>
                      <dd className="text-black">{product.care}</dd>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 py-2">
                      <dt className="text-gray-600">Origem</dt>
                      <dd className="text-black">{product.origin}</dd>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 py-2">
                      <dt className="text-gray-600">SKU</dt>
                      <dd className="text-black">{product.sku}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="space-y-4" style={{ fontFamily: "'Calibri', 'sans-serif'" }}>
                <h3 className="text-2xl font-bold text-black mb-4">Envio & Devoluções</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-semibold text-black mb-3">Informações de Envio</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Envio gratuito mundial</li>
                      <li>• Entrega em 2-5 dias úteis</li>
                      <li>• Envio expresso disponível</li>
                      <li>• Acompanhe seu pedido online</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-black mb-3">Política de Devolução</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Política de devolução de 30 dias</li>
                      <li>• Devoluções gratuitas</li>
                      <li>• Processo de devolução fácil</li>
                      <li>• Garantia de reembolso total</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
);
};

export default ProductDetail;