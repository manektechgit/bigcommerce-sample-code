/**** Get Current Cart Id start ****/
var CurrentCartId = '';
function getCart(url) {
 return fetch(url, {
     method: "GET",
     credentials: "same-origin"
 })
 .then(response => response.json());
};
function getCheckoutId(cartData)
{
if(cartData)
{
  var parsedCartData = JSON.parse(cartData);
  CurrentCartId = parsedCartData[0].id;
}
}
getCart('/api/storefront/carts')
.then(data => getCheckoutId(JSON.stringify(data)))
.catch(error => console.error(error));
/**** Get Current Cart Id end ****/


/**** Create Cart start ****/
function redirectToCart()
{
  $("#quickOrderGridAddToCart").removeClass("QuickOrderGridATCloader");
  window.location.href="/cart.php";
}
function createCart(url, cartItems) {
return fetch(url, {
  method: "POST",
  credentials: "same-origin",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify(cartItems),
})
.then(response => response.json())
.catch(error => console.error(error));
};

function createCartFunction(cartCustomItems)
{
  createCart(`/api/storefront/carts`, {
      "line_items": cartCustomItems
    }
  )
  .then(data => redirectToCart() )
  .catch(error => console.error(error));
}
/**** Create Cart end ****/

/**** Add Items to Cart Start ****/
function addCartItem(url, cartId, cartItems) {
  return fetch(url + cartId + '/items', {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(cartItems),
  })
  .then(response => response.json())
  .catch(error => console.error(error));
};

function addCartItemFunction(crntCartId,cartQckOrdrItems)
{
    addCartItem(`/api/storefront/carts/`,crntCartId, {
      "line_items": cartQckOrdrItems
    })
    .then(data => redirectToCart())
    .catch(error => console.error(error));
}
/**** Add Items to Cart End ****/

var productViewId = $('.productViewId').text();
fetchProductOptionsforQuickOrderusingGrapQL(productViewId);

function QuickOrderGirdColotTrLoopForAddtoCartBtnActions()
{
  $(".prdctViewQuickOrderGridTbody .colorTr").each(function(){
    var flag = true;
    var prdctviewQOGridColorTrThis = $(this);
    prdctviewQOGridColorTrThis.find('.colorData').each(function(){
      var prdctviewQOGridColorDataThis = $(this);
      var gridColorDataQtyVal = prdctviewQOGridColorDataThis.find(".QuickOrderGridInputQty").val();
      if(gridColorDataQtyVal > 0)
      {
        $("#quickOrderGridAddToCart .AddToCartBtn").text("");
        $("#quickOrderGridAddToCart .AddToCartBtn").text("Add to basket");
        $("#quickOrderGridAddToCart").attr("disabled",false);
        flag = false;
        return false;
      }
      else
      {
        $("#quickOrderGridAddToCart .AddToCartBtn").text("");
        $("#quickOrderGridAddToCart .AddToCartBtn").text("Enter Quantity");
        $("#quickOrderGridAddToCart").attr("disabled",true);
      }
    });
    return flag;
  });
}

$(document).on("change",".QuickOrderGridInputQty",function(){
    var QOGrdInputQtyThis = $(this);
    var QOGrdInputQtyVal = QOGrdInputQtyThis.val();
    var QOGrdAvailableStock = QOGrdInputQtyThis.data('variantavailblstock');
    if(QOGrdInputQtyVal > 0)
    {
      if(QOGrdInputQtyVal > QOGrdAvailableStock)
      {
        $(".QtyExceededErrMsg").remove();
        $( '<p class="QtyExceededErrMsg" style="color:red;">QTY. EXCEEDED</p>' ).insertAfter( QOGrdInputQtyThis );
        $(".QtyExceededErrMsg").delay(1500).hide("slow");
        QOGrdInputQtyThis.val('');
        QuickOrderGirdColotTrLoopForAddtoCartBtnActions();
      }
      else
      {
        $("#quickOrderGridAddToCart .AddToCartBtn").text("");
        $("#quickOrderGridAddToCart .AddToCartBtn").text("Add to basket");
        $("#quickOrderGridAddToCart").attr("disabled",false);
      }
    }
    else
    {
      QuickOrderGirdColotTrLoopForAddtoCartBtnActions();
    }
});

$(document).on("click","#quickOrderGridAddToCart",function(){
    $(this).addClass("QuickOrderGridATCloader");
    var DataToBeAddedToCart = [];

    $(".prdctViewQuickOrderGridTbody .colorTr").each(function(){
      var prdctViewQckOrdrGrdColorTrThis = $(this);
        prdctViewQckOrdrGrdColorTrThis.find('.colorData').each(function(){
          var prdctViewQckOrdrGrdColorDataThis = $(this);
          var QOGrdCartItemQty = prdctViewQckOrdrGrdColorDataThis.find(".QuickOrderGridInputQty").val();
          var QOGrdCartItemVariantId = '';
          var QOGrdCartItemSKU = '';
          var QOGrdCartItemId = '';
          if(QOGrdCartItemQty != '')
          {
            QOGrdCartItemId = productViewId
            QOGrdCartItemSKU = prdctViewQckOrdrGrdColorDataThis.find(".QuickOrderGridInputQty").data('variantsku');
            QOGrdCartItemVariantId = prdctViewQckOrdrGrdColorDataThis.find(".QuickOrderGridInputQty").data('variantid');
            var CartDataObj = {
                  quantity: QOGrdCartItemQty,
                  productId: QOGrdCartItemId,
                  variantId: QOGrdCartItemVariantId,
                  sku: QOGrdCartItemSKU
              };
              DataToBeAddedToCart.push(CartDataObj);
          }
        });
    });
    var DataJsonForCart = JSON.stringify(DataToBeAddedToCart);

    if(CurrentCartId)
    {
      addCartItemFunction(CurrentCartId,DataToBeAddedToCart)
    }
    else
    {
        createCartFunction(DataToBeAddedToCart);
    }
});

$(document).on('focus click', '.QuickOrderGridInputQty',  function(){
    $(this).next('.stock-text').hide();
    $('.colorTr').removeClass('is-Active');
    $(this).parents('.colorTr').addClass('is-Active');
    var sizeName = $(this).parents('.colorData').data('sizename');
    $('.sizeth').removeClass('is-Active');
    $(".sizeTr .sizeth").each(function() {
        var sizeThThis = $(this);
        var sizeText = sizeThThis.text();
        if(sizeText == sizeName)
        {
          sizeThThis.addClass('is-Active');
        }
    });
});

$(document).on('blur', '.QuickOrderGridInputQty',  function(e){
    if( !$(this).val() ) {
        $(this).next('.stock-text').show();
    }
});

$('html').click(function(e) {
   if(!$(e.target).hasClass('productView-QuickOrderGrid') )
   {
       $('.colorTr').removeClass('is-Active');
       $('.sizeth').removeClass('is-Active');
   }
});