function getCookie(name) {
  const nameEQ = `${name}=`;
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i].trim();
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length);
  }
  return null;
}

function setCookie(name, value, days) {
  let expires = '';
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = '; expires=' + date.toUTCString();
  }
  document.cookie = `${name}=${value || ''}${expires}; path=/`;
}

document.getElementById('locationForm').addEventListener('submit', function (event) {
  event.preventDefault(); // フォームの送信をキャンセル

  const lat = parseFloat(document.getElementById('latitude').value);
  const lng = parseFloat(document.getElementById('longitude').value);
  const minDistance = parseFloat(document.getElementById('minDistance').value);
  const maxDistance = parseFloat(document.getElementById('maxDistance').value);

  // ハーヴァーサイン公式を使用して2点間の距離を計算
  function haversineDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // 地球の半径 (km)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // 距離 (km)
  }

  // ランダム地点を生成
  function generateRandomPoint(lat, lng, minDistance, maxDistance) {
    let distance = Math.random() * (maxDistance - minDistance) + minDistance; // ランダムな距離
    let bearing = Math.random() * 2 * Math.PI; // ランダムな方向 (ラジアン)

    let lat1 = lat * Math.PI / 180; // 緯度をラジアンに変換
    let lng1 = lng * Math.PI / 180; // 経度をラジアンに変換
    let dR = distance / 6371; // 距離を地球の半径で割ってラジアンに変換

    let newLat = Math.asin(Math.sin(lat1) * Math.cos(dR) + Math.cos(lat1) * Math.sin(dR) * Math.cos(bearing));
    let newLng = lng1 + Math.atan2(Math.sin(bearing) * Math.sin(dR) * Math.cos(lat1), Math.cos(dR) - Math.sin(lat1) * Math.sin(newLat));

    newLat = newLat * 180 / Math.PI; // ラジアンから度に変換
    newLng = newLng * 180 / Math.PI; // ラジアンから度に変換
    return {lat: newLat, lng: newLng};
  }

  // ランダム地点の生成と距離の確認を行う
  let attempts = 0;
  let newPoint;
  let distance;
  do {
    newPoint = generateRandomPoint(lat, lng, minDistance, maxDistance);
    distance = haversineDistance(lat, lng, newPoint.lat, newPoint.lng);
    attempts++;
    // 無限ループ防止のための安全策
    if (attempts > 100) {
      alert('適切な地点が見つかりませんでした。パラメータを調整してください。');
      return;
    }
  } while (distance < minDistance || distance > maxDistance);

  // 結果を整理して表示
  const resultDiv = document.getElementById('result');
  resultDiv.innerHTML = `
  <div class="wrapper">
    <ul>
      <li>緯度: ${newPoint.lat}</li>
      <li>経度: ${newPoint.lng}</li>
    </ul>
    <div>直線距離: ${distance.toFixed(2)} km</div>
    <!-- Google Mapsで表示するボタン -->
    <button id="viewOnMap" style="display: none;">Google Mapsで表示</button>
  </div>
`;

  // Google Mapsで経路を表示するボタンを表示し、リンクを設定
  const viewOnMapButton = document.getElementById('viewOnMap');
  viewOnMapButton.style.display = 'inline-block'; // ボタンを表示
  viewOnMapButton.onclick = function () {
    // 出発地点の緯度経度
    const originLat = document.getElementById('latitude').value;
    const originLng = document.getElementById('longitude').value;
    // 目的地の緯度経度は、計算された新しい地点
    const destinationLat = newPoint.lat;
    const destinationLng = newPoint.lng;

    // Google Mapsで経路を表示するURLを開く
    window.open(`https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${destinationLat},${destinationLng}`, '_blank');
  };

  // 入力値をクッキーに保存
  setCookie('latitude', document.getElementById('latitude').value, 30);
  setCookie('longitude', document.getElementById('longitude').value, 30);
  setCookie('minDistance', document.getElementById('minDistance').value, 30);
  setCookie('maxDistance', document.getElementById('maxDistance').value, 30);
});

document.addEventListener('DOMContentLoaded', (event) => {
  if (getCookie('latitude')) document.getElementById('latitude').value = getCookie('latitude');
  if (getCookie('longitude')) document.getElementById('longitude').value = getCookie('longitude');
  if (getCookie('minDistance')) document.getElementById('minDistance').value = getCookie('minDistance');
  if (getCookie('maxDistance')) document.getElementById('maxDistance').value = getCookie('maxDistance');
});
