import useCart from "../hooks/useCart.js";

export default function Cart() {
  const { items, remove, clear, total } = useCart();
  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: 16 }}>
      <h2>Giỏ hàng</h2>
      {items.length === 0 ? (<p>Giỏ hàng trống.</p>) : (
        <>
          <table width="100%" border="1" cellPadding="6">
            <thead><tr><th>Ảnh</th><th>Tên</th><th>SL</th><th>Giá</th><th>Tổng</th><th></th></tr></thead>
            <tbody>
              {items.map((i) => (
                <tr key={i.id}>
                  <td style={{ textAlign: "center" }}>{i.image ? <img src={i.image} style={{ width: 48, height: 48, objectFit: "cover" }} /> : null}</td>
                  <td>{i.name}</td>
                  <td>{i.qty}</td>
                  <td>{i.price.toLocaleString()} đ</td>
                  <td>{(i.price * i.qty).toLocaleString()} đ</td>
                  <td><button onClick={() => remove(i.id)}>Xóa</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
            <button onClick={clear}>Xóa tất cả</button>
            <div style={{ fontWeight: 700 }}>Tạm tính: {total.toLocaleString()} đ</div>
          </div>
        </>
      )}
    </div>
  );
}


