import React, { useState, useEffect, useMemo } from 'react';
import { Folder, FileText, ChevronRight, Play, Settings, Clock, CheckCircle, XCircle, RotateCcw, Home, ArrowLeft } from 'lucide-react';

// --- USER PROVIDED DATA ---
// ここにユーザーから提供されたJSONデータをそのまま格納します。
const RAW_DATA = [
  {
    "test_name": "第1回 小テスト",
    "questions": [
      {
        "question_number": 1,
        "question_text": "1.5Mビット/秒の伝送路を用いて12Mバイトのデータを転送するために必要な伝送時間は何秒か。ここで、伝送路の伝送効率を50%とする。(H30秋)",
        "options": {
          "ア": "16",
          "イ": "32",
          "ウ": "64",
          "エ": "128"
        },
        "answer": "エ"
      },
      {
        "question_number": 2,
        "question_text": "100Mビット/秒のLANを使用し、1件のレコード長が1,000バイトの電文を1,000件連続して伝送するとき、伝送時間は何秒か。ここで、LANの伝送効率は50%とする。(R3)",
        "options": {
          "ア": "0.02",
          "イ": "0.08",
          "ウ": "0.16",
          "エ": "1.6"
        },
        "answer": "ウ"
      },
      {
        "question_number": 3,
        "question_text": "10Mビット/秒の回線で接続された端末間で、平均1Mバイトのファイルを、10秒ごとに転送するときの回線利用率は何%か。ここで、ファイル転送時には、転送量の20%が制御情報として付加されるものとし、1Mビット=10^6ビットとする。(R1秋)",
        "options": {
          "ア": "1.2",
          "イ": "6.4",
          "ウ": "8.0",
          "エ": "9.6"
        },
        "answer": "エ"
      },
      {
        "question_number": 4,
        "question_text": "符号化速度が192kビット/秒の音声データ2.4Mバイトを、通信速度が128kビット/秒のネットワークを用いてダウンロードしながら途切れることなく再生するには、再生開始前のデータのバッファリング時間として最低何秒間が必要か。(H29秋)",
        "options": {
          "ア": "50",
          "イ": "100",
          "ウ": "150",
          "エ": "250"
        },
        "answer": "ア"
      }
    ]
  },
  {
    "test_name": "第2回 小テスト",
    "questions": [
      {
        "question_number": 1,
        "question_text": "OSI基本参照モデルにおいて、エンドシステム間のデータ伝送の中継と経路制御の機能をもつ層はどれか。(H24)",
        "options": {
          "ア": "セッション層",
          "イ": "データリンク層",
          "ウ": "トランスポート層",
          "エ": "ネットワーク層"
        },
        "answer": "エ"
      },
      {
        "question_number": 2,
        "question_text": "OSI基本参照モデルの各層で中継する装置を、物理層で中継する装置、データリンク層で中継する装置、ネットワーク層で中継する装置の順に並べたものはどれか。(R3)",
        "options": {
          "ア": "ブリッジ, リピータ, ルータ",
          "イ": "ブリッジ, ルータ, リピータ",
          "ウ": "リピータ, ブリッジ, ルータ",
          "エ": "リピータ, ルータ, ブリッジ"
        },
        "answer": "ウ"
      },
      {
        "question_number": 3,
        "question_text": "イーサネットで使用されるメディアアクセス制御方式であるCSMA/CDに関する記述として、適切なものはどれか。(R2秋)",
        "options": {
          "ア": "それぞれのステーションがキャリア検知を行うとともに、送信データの衝突が起きた場合は再送する。",
          "イ": "タイムスロットと呼ばれる単位で分割して、同一周波数において複数の通信を可能にする。",
          "ウ": "データ送受信の開始時にデータ送受信のネゴシエーションとしてRTS/CTS方式を用い、受信の確認はACKを使用する。",
          "エ": "伝送路上にトークンを巡回させ、トークンを受け取った端末だけがデータ送信できる。"
        },
        "answer": "ア"
      },
      {
        "question_number": 4,
        "question_text": "ルータの機能に関する記述のうち、適切なものはどれか。(R4秋)",
        "options": {
          "ア": "MACアドレステーブルの登録情報によって、データフレームをあるポートだけに中継するか、全てのポートに中継するか判断する。",
          "イ": "OSI基本参照モデルのデータリンク層において、ネットワーク同士を接続する。",
          "ウ": "OSI基本参照モデルのトランスポート層からアプリケーション層までの階層で、プロトコルの変換を行う。",
          "エ": "伝送媒体やアクセス制御方式の異なるネットワークの接続が可能であり、送信データのIPアドレスを識別し、データの転送経路を決定する。"
        },
        "answer": "エ"
      }
    ]
  },
  {
    "test_name": "第3回 小テスト",
    "questions": [
      {
        "question_number": 1,
        "question_text": "TCP/IP階層モデルにおいて、TCPが属する層はどれか。(H23秋)",
        "options": {
          "ア": "アプリケーション層",
          "イ": "インターネット層",
          "ウ": "トランスポート層",
          "エ": "リンク層"
        },
        "answer": "ウ"
      },
      {
        "question_number": 2,
        "question_text": "次のネットワークアドレスとサブネットマスクをもつネットワークがある。このネットワークをあるPCが利用する場合、そのPCに割り振ってはいけないIPアドレスはどれか。\nネットワークアドレス: 200.170.70.16\nサブネットマスク: 255.255.255.240",
        "options": {
          "ア": "200.170.70.17",
          "イ": "200.170.70.20",
          "ウ": "200.170.70.30",
          "エ": "200.170.70.31"
        },
        "answer": "エ"
      },
      {
        "question_number": 3,
        "question_text": "クライアントAがポート番号8080のHTTPプロキシサーバBを経由してポート番号80のWebサーバCにアクセスしているとき、宛先ポート番号が常に8080になるTCPパケットはどれか。(R1秋)",
        "options": {
          "ア": "AからBへのHTTP要求及びCからBへのHTTP応答。",
          "イ": "AからBへのHTTP要求だけ。",
          "ウ": "BからAへのHTTP要求だけ。",
          "エ": "BからCへのHTTP要求及びCからBへのHTTP応答。"
        },
        "answer": "イ"
      },
      {
        "question_number": 4,
        "question_text": "DHCPの説明として、適切なものはどれか。(R3)",
        "options": {
          "ア": "IPアドレスの設定を自動化するためのプロトコルである。",
          "イ": "ディレクトリサービスにアクセスするためのプロトコルである。",
          "ウ": "電子メールを転送するためのプロトコルである。",
          "エ": "プライベートIPアドレスをグローバルIPアドレスに変換するためのプロトコルである。"
        },
        "answer": "ア"
      }
    ]
  },
  {
    "test_name": "第5回 小テスト",
    "questions": [
      {
        "question_number": 1,
        "question_text": "LANに接続されているプリンターのMACアドレスを, 同一LAN上のPCから調べるときに使用するコマンドはどれか。ここで, PCはこのプリンターを直前に使用しており, プリンターのIPアドレスは分かっているものとする。(H30春)",
        "options": {
          "ア": "arp",
          "イ": "ipconfig",
          "ウ": "netstat",
          "エ": "ping"
        },
        "answer": "ア"
      },
      {
        "question_number": 2,
        "question_text": "ONF (Open Networking Foundation) が標準化を進めているOpenFlowプロトコルを用いたSDN (Software-Defined Networking) の説明として, 適切なものはどれか。(R4)",
        "options": {
          "ア": "管理ステーションから定期的にネットワーク機器のMIB (Management Information Base) 情報を取得して, 稼働監視や性能管理を行うためのネットワーク管理手法",
          "イ": "データ転送機能をもつネットワーク機器同士が経路情報を交換して, ネットワーク全体のデータ転送経路を決定する方式",
          "ウ": "ネットワーク制御機能とデータ転送機能を実装したソフトウェアを, 仮想環境で利用するための技術",
          "エ": "ネットワーク制御機能とデータ転送機能を論理的に分離し, コントローラと呼ばれるソフトウェアで, データ転送機能をもつネットワーク機器の集中制御を可能とするアーキテクチャ"
        },
        "answer": "エ"
      },
      {
        "question_number": 3,
        "question_text": "SMTPの説明として, 適切なものはどれか。(H17秋)",
        "options": {
          "ア": "Webサーバに格納されている情報をアクセスするためのプロトコルである。",
          "イ": "電子化された文字, 図形, イメージが混在した文書の作成や編集を行うシステムである。",
          "ウ": "電子メールを転送するためのプロトコルである。",
          "エ": "文書の構造表現が可能な文書記述用言語の一つである。"
        },
        "answer": "ウ"
      },
      {
        "question_number": 4,
        "question_text": "Webサーバにおいて, クライアントからの要求に応じてアプリケーションプログラムを実行して, その結果をWebブラウザに返すなどのインタラクティブなページを実現するために, Webサーバと外部プログラムを連携させる仕組みはどれか。(H30春)",
        "options": {
          "ア": "CGI",
          "イ": "HTML",
          "ウ": "MIME",
          "エ": "URL"
        },
        "answer": "ア"
      }
    ]
  },
  {
    "test_name": "第6回 小テスト",
    "questions": [
      {
        "question_number": 1,
        "question_text": "スパイウェアに該当するものはどれか。(H28春)",
        "options": {
          "ア": "Webサイトへの不正な入力を排除するために, Webサイトの入力フォームの入力データから, HTMLタグ, JavaScript, SQL文などを検出し, それらを他の文字列に置き換えるプログラム",
          "イ": "サーバへの侵入口となる脆弱なポートを探すために, 攻撃者のPCからサーバのTCPポートに順にアクセスするプログラム",
          "ウ": "利用者の意図に反してPCにインストールされ, 利用者の個人情報やアクセス履歴などの情報を収集するプログラム",
          "エ": "利用者のパスワードを調べるために, サーバにアクセスし, 辞書に載っている単語を総当たりで試すプログラム"
        },
        "answer": "ウ"
      },
      {
        "question_number": 2,
        "question_text": "マルウェアについて, トロイの木馬とワームを比較したとき, ワームの特徴はどれか。(H29秋)",
        "options": {
          "ア": "勝手にファイルを暗号化して正常に読めなくする",
          "イ": "単独のプログラムとして不正な動作を行う",
          "ウ": "特定の条件になるまで活動できずに待機する",
          "エ": "ネットワークやリムーバブルメディアを媒介として自ら感染を広げる"
        },
        "answer": "エ"
      },
      {
        "question_number": 3,
        "question_text": "SQLインジェクション攻撃の説明として, 適切なものはどれか。(R2)",
        "options": {
          "ア": "Webアプリケーションのデータ操作言語の呼び出し方に不備がある場合に, 攻撃者が悪意をもって構成した文字列を入力することによって, データベースのデータの不正な取得, 改ざん及び削除をする攻撃",
          "イ": "Webサイトに対して, 他のサイトを介して大量のパケットを送り付け, そのネットワークトラフィックの異常を高めてサービスを提供不能にする攻撃",
          "ウ": "確保されているメモリ空間の下限又は上限を超えてデータの書き込みと読み出しを行うことによって, プログラムを異常終了させたりデータエリアに挿入された不正なコードを実行させたりする攻撃",
          "エ": "攻撃者が罠を仕掛けたWebページを利用者が閲覧し, 当該ページ内のリンクをクリックしたときに, 不正スクリプトを含む文字列が脆弱なWebサーバに送り込まれ, レスポンスに埋め込まれた不正スクリプトの実行によって, 情報漏洩をもたらす攻撃"
        },
        "answer": "ア"
      },
      {
        "question_number": 4,
        "question_text": "攻撃者が用意したサーバXのIPアドレスが, A社WebサーバのFQDNに対応するIPアドレスとして, B社DNSキャッシュサーバに記憶された。これによって, 意図せずサーバXに誘導されてしまう利用者はどれか。ここで, A社, B社の従業員は自社のDNSキャッシュサーバを利用して名前解決を行う。(R1)",
        "options": {
          "ア": "A社WebサーバにアクセスしようとするA社従業員",
          "イ": "A社WebサーバにアクセスしようとするB社従業員",
          "ウ": "B社WebサーバにアクセスしようとするA社従業員",
          "エ": "B社WebサーバにアクセスしようとするB社従業員"
        },
        "answer": "イ"
      }
    ]
  },
  {
    "test_name": "第7回 小テスト",
    "questions": [
      {
        "question_number": 1,
        "question_text": "ファイアウォールのパケットフィルタリング機能を利用して実現できるものはどれか。(H18春)",
        "options": {
          "ア": "インターネットから受け取ったパケットに改ざんがある場合は修正し, 改ざんが修正できない場合には, ログを取って内部ネットワークへの通過を阻止する",
          "イ": "インターネットから受け取ったパケットのヘッダー部分及びデータ部分に, 改ざんがあるかどうかをチェックし, 改ざんがあった場合にはそのパケットを除去する",
          "ウ": "動的に割り当てられたTCPポート番号をもったパケットを, 受信側で固定値のTCPポート番号をもったパケットに変更して, 内部のネットワークへの通過を許可する",
          "エ": "特定のTCPポート番号をもったパケットだけに, インターネットから内部ネットワークへの通過を許可する"
        },
        "answer": "エ"
      },
      {
        "question_number": 2,
        "question_text": "WAFの説明はどれか。(H28秋)",
        "options": {
          "ア": "Webアクセスに対するアクセス内容を監視し, 攻撃とみなされるパターンを検知したときに当該するアクセスを遮断する",
          "イ": "Wi-Fiアライアンスが認定した無線LANの暗号化方式の規格であり, AES暗号に対応している",
          "ウ": "様々なシステムの動作ログを一元的に蓄積, 管理し, セキュリティ上の脅威となる事象をいち早く検知, 分析する",
          "エ": "ファイアウォール機能を有し, ウイルス対策, 侵入検知などを連携させ, 複数のセキュリティ機能を統合的に管理する"
        },
        "answer": "ア"
      },
      {
        "question_number": 3,
        "question_text": "公開鍵暗号方式の用法に関する記述のうち, 送信者が間違いなく本人であることを受信者が確認できるのはどれか。(H17春)",
        "options": {
          "ア": "送信者は自分の公開鍵で暗号化し, 受信者は自分の秘密鍵で復号する",
          "イ": "送信者は自分の秘密鍵で暗号化し, 受信者は送信者の公開鍵で復号する",
          "ウ": "送信者は受信者の公開鍵で暗号化し, 受信者は自分の秘密鍵で復号する",
          "エ": "送信者は受信者の秘密鍵で暗号化し, 受信者は自分の公開鍵で復号する"
        },
        "answer": "イ"
      },
      {
        "question_number": 4,
        "question_text": "メッセージにRSA方式のデジタル署名を付与して2者間で送受信する。そのときのデジタル署名の検証鍵と使用方法はどれか。(R1秋)",
        "options": {
          "ア": "受信者の公開鍵であり, 送信者がメッセージダイジェストからデジタル署名を作成する際に使用する",
          "イ": "受信者の秘密鍵であり, 受信者がデジタル署名からメッセージダイジェストを算出する際に使用する",
          "ウ": "送信者の公開鍵であり, 受信者がデジタル署名からメッセージダイジェストを算出する際に使用する",
          "エ": "送信者の秘密鍵であり, 送信者がメッセージダイジェストからデジタル署名を作成する際に使用する"
        },
        "answer": "ウ"
      }
    ]
  },
  {
    "test_name": "第8回 小テスト",
    "questions": [
      {
        "question_number": 1,
        "question_text": "リスクアセスメントを構成するプロセスの組み合わせはどれか。(H29秋)",
        "options": {
          "ア": "リスク特定, リスク評価, リスク受容",
          "イ": "リスク特定, リスク分析, リスク評価",
          "ウ": "リスク分析, リスク対応, リスク受容",
          "エ": "リスク分析, リスク評価, リスク対応"
        },
        "answer": "イ"
      },
      {
        "question_number": 2,
        "question_text": "リスク対応のうち, リスクファイナンシングに該当するものはどれか。(H31春)",
        "options": {
          "ア": "システムが被害を受けるリスクを想定して, 保険を掛ける。",
          "イ": "システムの被害につながるリスクの顕在化を抑える対策に資金を投入する。",
          "ウ": "リスクが大きいと評価されたシステムを廃止し, 新たなセキュアなシステムの構築に資金を投入する。",
          "エ": "リスクが顕在化した場合のシステムの被害を小さくする設備に資金を投入する。"
        },
        "answer": "ア"
      },
      {
        "question_number": 3,
        "question_text": "ペネトレーションテストに該当するものはどれか。(R6)",
        "options": {
          "ア": "検査対象の実行プログラムの設計書, ソースコードに着目し, 開発プロセスの各程にセキュリティ上の問題がないかどうかをツールや目視で確認する。",
          "イ": "公開Webサーバの各コンテンツファイルのハッシュ値を管理し, 定期的に各ファイルから生成したハッシュ値と一致するかどうかを確認する。",
          "ウ": "公開Webサーバや組織のネットワークの脆弱性を探索し, サーバに実際に侵入できるかどうかを確認する。",
          "エ": "内部ネットワークのサーバやネットワーク機器のIPFIX情報から, 各PCの通信に異常な振る舞いがないかどうかを確認する。"
        },
        "answer": "ウ"
      },
      {
        "question_number": 4,
        "question_text": "ファジングで得られるセキュリティ上の効果はどれか。(H31春)",
        "options": {
          "ア": "ソフトウェアの脆弱性を自動的に修正できる。",
          "イ": "ソフトウェアの脆弱性を検出できる。",
          "ウ": "複数のログデータを相関分析し, 不正アクセスを検知できる。",
          "エ": "利用者IDを統合的に管理し, 統一したパスワードポリシーを適用できる。"
        },
        "answer": "イ"
      }
    ]
  },
  {
    "test_name": "第9回 小テスト",
    "questions": [
      {
        "question_number": 1,
        "question_text": "デジタルフォレンジックスの説明として, 適切なものはどれか。(R3)",
        "options": {
          "ア": "あらかじめ設定した運用基準に従って, メールサーバを通過する送受信メールをフィルタリングすること",
          "イ": "外部からの攻撃や不正なアクセスからサーバを防御すること",
          "ウ": "磁気ディスクなどの書き換え可能な記憶媒体を単に初期化するだけではデータを復元できる可能性があるので, 任意のデータ列で上書きすること",
          "エ": "不正アクセスなどコンピュータに関する犯罪の法的な証拠性を確保できるように, 原因究明に必要な情報を保全, 収集, 分析をすること"
        },
        "answer": "エ"
      },
      {
        "question_number": 2,
        "question_text": "HTTPS (HTTP over SSL/TLS) の機能を用いて実現できるものはどれか。(H26秋)",
        "options": {
          "ア": "SQLインジェクションによるWebサーバへの攻撃を防ぐ。",
          "イ": "TCPポート80番と443番以外の通信を遮断する。",
          "ウ": "Webサーバとブラウザの間の通信を暗号化する。",
          "エ": "Webサーバへの不正なアクセスをネットワーク層でのパケットフィルタリングによって制限する。"
        },
        "answer": "ウ"
      },
      {
        "question_number": 3,
        "question_text": "インターネットに接続された利用者のPCから, DMZ上の公開Webサイトにアクセスし, 利用者の個人情報を入力すると, その個人情報が内部ネットワークのデータベース (DB) サーバに蓄積されるシステムがある。このシステムにおいて, 利用者個人のデジタル証明書を用いたTLS通信を行うことによって期待できるセキュリティ上の効果はどれか。(R2)",
        "options": {
          "ア": "PCとDBサーバ間の通信データを暗号化するとともに, 正当なDBサーバであるかを検証することができるようになる。",
          "イ": "PCとDBサーバ間の通信データを暗号化するとともに, 利用者を認証することができるようになる。",
          "ウ": "PCとWebサーバ間の通信データを暗号化するとともに, 正当なDBサーバであるかを検証することができるようになる。",
          "エ": "PCとWebサーバ間の通信データを暗号化するとともに, 利用者を認証することができるようになる。"
        },
        "answer": "エ"
      },
      {
        "question_number": 4,
        "question_text": "電子メールに用いられるS/MIMEの機能はどれか。(H20春)",
        "options": {
          "ア": "内容の圧縮",
          "イ": "内容の暗号化と署名",
          "ウ": "内容の開封通知",
          "エ": "内容の再送"
        },
        "answer": "イ"
      }
    ]
  },
  {
    "test_name": "第10回 小テスト",
    "questions": [
      {
        "question_number": 1,
        "question_text": "関係モデルとその実装である関係データベースの対応に関する記述のうち, 適切なものはどれか。(R2)",
        "options": {
          "ア": "関係は, 表に対応付けられる",
          "イ": "属性も列も, 左から右に順序付けられる",
          "ウ": "タプルも行も, ともに重複しない",
          "エ": "定義域は, 文字型又は文字列型に対応付けられる"
        },
        "answer": "ア"
      },
      {
        "question_number": 2,
        "question_text": "DBMSにおいて, スキーマを決める機能はどれか。(H27秋)",
        "options": {
          "ア": "機密保護機能",
          "イ": "障害回復機能",
          "ウ": "定義機能",
          "エ": "保全機能"
        },
        "answer": "ウ"
      },
      {
        "question_number": 3,
        "question_text": "DBMSが, 3層スキーマアーキテクチャを採用する目的として, 適切なものはどれか。(H27春)",
        "options": {
          "ア": "関係演算によって元の表から新たな表を導出し, それが実在しているように見せる。",
          "イ": "対話的に使われるSQL文を, アプリケーションプログラムからも使えるようにする。",
          "ウ": "データの物理的な格納構造を変更しても, アプリケーションプログラムに影響が及ばないようにする。",
          "エ": "プログラム言語を限定して, アプリケーションプログラムとDBMSを緊密に結合する。"
        },
        "answer": "ウ"
      },
      {
        "question_number": 4,
        "question_text": "データベースを記録媒体にどのように格納するかを記述したものはどれか。(H18秋)",
        "options": {
          "ア": "概念スキーマ",
          "イ": "外部スキーマ",
          "ウ": "サブスキーマ",
          "エ": "内部スキーマ"
        },
        "answer": "エ"
      }
    ]
  },
  {
    "test_name": "第11回 小テスト",
    "questions": [
      {
        "question_number": 1,
        "question_text": "データモデルにおいて, データの関係を木構造で表すものはどれか。(H17秋)",
        "options": {
          "ア": "E-Rモデル",
          "イ": "階層モデル",
          "ウ": "関係モデル",
          "エ": "ネットワークモデル"
        },
        "answer": "イ"
      },
      {
        "question_number": 2,
        "question_text": "関係データモデルにおいて, 属性が取り得る値の集合を意味する用語はどれか。(H18秋)",
        "options": {
          "ア": "関係 (リレーション)",
          "イ": "実現値",
          "ウ": "タプル (組)",
          "エ": "定義域"
        },
        "answer": "エ"
      },
      {
        "question_number": 3,
        "question_text": "データベースの概念設計に用いられ, 対象世界を, 実体と実体間の関連という2つの概念で表現するデータモデルはどれか。(H20秋)",
        "options": {
          "ア": "E-Rモデル",
          "イ": "階層モデル",
          "ウ": "関係モデル",
          "エ": "ネットワークモデル"
        },
        "answer": "ア"
      },
      {
        "question_number": 4,
        "question_text": "E-R図に関する記述として, 適切なものはどれか。(H28秋)",
        "options": {
          "ア": "関係データベースの表として実装することを前提に表現する",
          "イ": "業務で扱う情報をエンティティ及びエンティティ間のリレーションシップとして表現する",
          "ウ": "データの生成から消滅に至るデータ操作を表現する",
          "エ": "リレーションシップは, 業務上の手順を表現する"
        },
        "answer": "イ"
      }
    ]
  },
  {
    "test_name": "第12回 小テスト",
    "questions": [
      {
        "question_number": 1,
        "question_text": "SQL文において FOREIGN KEY と REFERENCES を用いて指定する制約はどれか。(H29秋)",
        "options": {
          "ア": "キー制約",
          "イ": "検査制約",
          "ウ": "参照制約",
          "エ": "表明"
        },
        "answer": "ウ"
      },
      {
        "question_number": 2,
        "question_text": "関係データベースにおいて, 外部キーを定義する目的として, 適切なものはどれか。(H28春)",
        "options": {
          "ア": "関連する相互のテーブルにおいて, レコード間の参照一貫性が維持される制約をもたせる。",
          "イ": "関連する相互テーブルの格納場所を近くに配置することによって, 検索, 更新を高速に行う。",
          "ウ": "障害によって破壊されたレコードを, テーブル間の相互の関係から可能な限り復旧させる。",
          "エ": "レコードの削除, 追加の繰返しによる, レコードの格納エリアのフラグメンテーションを防止する。"
        },
        "answer": "ア"
      },
      {
        "question_number": 3,
        "question_text": "関係データベースの主キー制約の条件として, キー値が重複していないことの他に, 主キーを構成する列に必要な条件はどれか。(H25秋)",
        "options": {
          "ア": "キー値が空でないこと",
          "イ": "構成する列が1つであること",
          "ウ": "表の先頭に定義されている列であること",
          "エ": "別の表の候補キーとキー値が一致していること"
        },
        "answer": "ア"
      },
      {
        "question_number": 4,
        "question_text": "関係データベースの主キーの性質として, 適切なものはどれか。(H21秋)",
        "options": {
          "ア": "主キーとした列に対して検索条件を指定しなければ, 行の検索はできない。",
          "イ": "数値型の列を主キーに指定すると, その列は算術演算の対象としては使えない。",
          "ウ": "1つの表の中に, 主キーの値が同じ行が複数存在することはできない。",
          "エ": "複数の列からなる主キーを構成することはできない。"
        },
        "answer": "ウ"
      }
    ]
  },
  {
    "test_name": "第13回 小テスト",
    "questions": [
      {
        "question_number": 1,
        "question_text": "関係データモデルにおいて, 関係から特定の属性だけを取り出す演算はどれか。(R1秋)",
        "options": {
          "ア": "結合 (Join)",
          "イ": "射影 (Projection)",
          "ウ": "選択 (Selection)",
          "エ": "和 (Union)"
        },
        "answer": "イ"
      },
      {
        "question_number": 2,
        "question_text": "関係代数の演算のうち, 関係 R, S の直積 R × S に対応する SELECT 文はどれか。ここで, 関係 R, S を表 R, S に対応させ, 表 R 及び S にそれぞれ行の重複はないものとする。(H28秋)",
        "options": {
          "ア": "SELECT * FROM R, S",
          "イ": "SELECT * FROM R EXCEPT SELECT * FROM S",
          "ウ": "SELECT * FROM R UNION SELECT * FROM S",
          "エ": "SELECT * FROM R INTERSECT SELECT * FROM S"
        },
        "answer": "ア"
      },
      {
        "question_number": 3,
        "question_text": "列 A1-A5 から成る R 表に対する次の SQL 文は, 関係代数のどの演算に対応するか。(H25春)\nSELECT A1, A2, A3 FROM R WHERE A4='a'",
        "options": {
          "ア": "結合と射影",
          "イ": "差と選択",
          "ウ": "選択と射影",
          "エ": "和と射影"
        },
        "answer": "ウ"
      },
      {
        "question_number": 4,
        "question_text": "同じ属性から成る関係 R と S がある。R と S の属性値の一部が一致する場合, 関係演算 R - (R - S) と同じ結果が得られるものはどれか。ここで, - は差集合, ∩ は共通集合, ∪ は和集合, × は直積, ÷ は商の演算を表す (H26春)",
        "options": {
          "ア": "R ∩ S",
          "イ": "R ∪ S",
          "ウ": "R × S",
          "エ": "R ÷ S"
        },
        "answer": "ア"
      }
    ]
  },
  {
    "test_name": "第14回 小テスト",
    "questions": [
      {
        "question_number": 1,
        "question_text": "“発注伝票” 表を第三正規形に書き換えたものはどれか。ここで, 下線部はキーを示す (R6)\n発注伝票 (注文番号, 商品番号, 商品名, 注文数量)",
        "options": {
          "ア": "発注 (注文番号, 注文数量), 商品 (商品番号, 商品名)",
          "イ": "発注 (注文番号, 注文数量), 商品 (注文番号, 商品番号, 商品名)",
          "ウ": "発注 (注文番号, 商品番号, 注文数量), 商品 (商品番号, 商品名)",
          "エ": "発注 (注文番号, 商品番号, 注文数量), 商品 (商品番号, 商品名, 注文番号)"
        },
        "answer": "ウ"
      },
      {
        "question_number": 2,
        "question_text": "関係, 注文記録 (注文番号, 注文日, 顧客番号, 顧客名, 商品番号, 商品名, 数量, 販売単価) の属性間に, {注文番号 → 注文日, 注文番号 → 顧客番号, 顧客番号 → 顧客名, {注文番号, 商品番号} → 数量, {注文番号, 商品番号} → 販売単価, 商品番号 → 商品名 } の関係がある。それに基づいて第三正規形までの正規化を行って, “商品”, “顧客”, “注文”, “注文明細” の各関係に分解した。関係 “注文明細” として, 適切なものはどれか。ここで, 実線の下線は主キーを表す。(R3)",
        "options": {
          "ア": "注文明細 (注文番号, 顧客番号, 商品番号, 数量, 販売単価)",
          "イ": "注文明細 (注文番号, 顧客番号, 数量, 販売単価)",
          "ウ": "注文明細 (注文番号, 商品番号, 数量, 販売単価)",
          "エ": "注文明細 (注文番号, 数量, 販売単価)"
        },
        "answer": "ウ"
      },
      {
        "question_number": 3,
        "question_text": "関係を第三正規形まで正規化して設計する目的はどれか。(H26秋)",
        "options": {
          "ア": "値の重複をなくすことによって, 格納効率を向上させる。",
          "イ": "関係を細かく分解することによって, 整合性制約を排除する。",
          "ウ": "冗長性を排除することによって, 更新時異状を回避する。",
          "エ": "属性間の結合度を低下させることによって, 更新時のロック待ちを減らす。"
        },
        "answer": "ウ"
      },
      {
        "question_number": 4,
        "question_text": "次の表はどこまで正規化されたものか。(R2春)",
        "table_data": [
          {
            "従業員番号": "12345",
            "氏名": "情報 太郎",
            "入社年": "1991",
            "職位": "部長",
            "職位手当": "90,000"
          },
          {
            "従業員番号": "12346",
            "氏名": "処理 次郎",
            "入社年": "2005",
            "職位": "課長",
            "職位手当": "50,000"
          },
          {
            "従業員番号": "12347",
            "氏名": "技術 三郎",
            "入社年": "2007",
            "職位": "課長",
            "職位手当": "50,000"
          }
        ],
        "options": {
          "ア": "第二正規形",
          "イ": "第三正規形",
          "ウ": "第四正規形",
          "エ": "非正規形"
        },
        "answer": "ア"
      }
    ]
  }
];

const generateRealData = () => {
  const courseId = 'info-process-2';
  
  // JSONデータをアプリの内部形式に変換
  const quizzes = RAW_DATA.map((item, index) => {
    // ID生成
    const quizId = `quiz-${index + 1}`;
    
    // Questions変換
    const questions = item.questions.map((q, qIndex) => {
      // 選択肢オブジェクトを配列に変換 (ア, イ, ウ, エ の順を保証)
      const options = [
        q.options['ア'],
        q.options['イ'],
        q.options['ウ'],
        q.options['エ']
      ];
      
      // 正解文字をインデックスに変換
      const correctMap = { 'ア': 0, 'イ': 1, 'ウ': 2, 'エ': 3 };
      const correctIndex = correctMap[q.answer];

      return {
        id: `q${index + 1}-${q.question_number}`, // q1-1, q1-2...
        text: q.question_text,
        options: options,
        correctIndex: correctIndex,
        tableData: q.table_data // 表データを追加で渡す
      };
    });

    return {
      id: quizId,
      title: item.test_name,
      description: `全${questions.length}問`, // 自動生成
      questions: questions
    };
  });

  return [
    {
      id: courseId,
      title: '情報処理入門２',
      description: '2025年度 後期',
      quizzes: quizzes
    }
  ];
};

const DATA = generateRealData();

// --- COMPONENTS ---

// Helper Component for Table Rendering
const SimpleTable = ({ data }) => {
  if (!data || data.length === 0) return null;
  const headers = Object.keys(data[0]);

  return (
    <div className="overflow-x-auto my-4 border border-gray-200 rounded-lg shadow-sm">
      <table className="min-w-full divide-y divide-gray-200 text-sm text-left">
        <thead className="bg-gray-50">
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="px-4 py-2 font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap border-r border-gray-200 last:border-r-0">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              {headers.map((h, j) => (
                <td key={j} className="px-4 py-2 text-gray-700 whitespace-nowrap border-r border-gray-200 last:border-r-0">
                  {row[h]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// 1. Breadcrumbs Navigation
const Breadcrumbs = ({ path, onNavigate }) => (
  <nav className="flex items-center text-sm text-gray-500 mb-6 overflow-x-auto whitespace-nowrap pb-2">
    <button onClick={() => onNavigate('home')} className="hover:text-blue-600 flex items-center">
      <Home size={16} className="mr-1" /> Home
    </button>
    {path.map((item, index) => (
      <React.Fragment key={item.id}>
        <ChevronRight size={16} className="mx-2" />
        <button 
          onClick={() => onNavigate(item.type, item.id)}
          className={`hover:text-blue-600 ${index === path.length - 1 ? 'font-bold text-gray-800' : ''}`}
        >
          {item.title}
        </button>
      </React.Fragment>
    ))}
  </nav>
);

// 2. Folder/Course List View
const FolderListView = ({ courses, onSelectCourse }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
    {courses.map(course => (
      <div 
        key={course.id}
        onClick={() => onSelectCourse(course)}
        className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md border border-gray-100 cursor-pointer transition-all hover:border-blue-300 flex flex-col items-center justify-center h-48 group"
      >
        <Folder size={64} className="text-blue-200 group-hover:text-blue-400 mb-4 transition-colors" />
        <h3 className="text-lg font-bold text-gray-800 text-center">{course.title}</h3>
        <p className="text-xs text-gray-400 mt-2">{course.description}</p>
        <span className="mt-4 text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
          {course.quizzes.length} フォルダ
        </span>
      </div>
    ))}
  </div>
);

// 3. Quiz List View (Inside a Course)
const QuizListView = ({ course, onSelectQuiz }) => (
  <div className="grid grid-cols-1 gap-3">
    {course.quizzes.map(quiz => (
      <div 
        key={quiz.id}
        onClick={() => onSelectQuiz(quiz)}
        className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:border-blue-400 cursor-pointer flex items-center justify-between transition-all"
      >
        <div className="flex items-center">
          <div className="bg-yellow-100 p-3 rounded-lg mr-4 text-yellow-600">
            <FileText size={24} />
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-gray-800 truncate">{quiz.title}</h4>
            <p className="text-sm text-gray-500 truncate">{quiz.description}</p>
          </div>
        </div>
        <ChevronRight className="text-gray-300 flex-shrink-0" />
      </div>
    ))}
  </div>
);

// 4. Quiz Detail/Menu View
const QuizMenuView = ({ quiz, onStart }) => {
  const [randomize, setRandomize] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{quiz.title}</h2>
        <p className="text-gray-600">{quiz.description}</p>
      </div>

      <div className="p-6">
        <div className="mb-8">
          <h3 className="font-bold text-gray-700 mb-4 flex items-center">
            <Settings size={18} className="mr-2" /> 設定
          </h3>
          <label className="flex items-center space-x-3 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 transition-colors">
            <input 
              type="checkbox" 
              checked={randomize} 
              onChange={(e) => setRandomize(e.target.checked)}
              className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500" 
            />
            <span className="text-gray-700">出題順をランダムにする</span>
          </label>
        </div>

        <div className="mb-8">
          <h3 className="font-bold text-gray-700 mb-4">収録されている問題 ({quiz.questions.length}問)</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {quiz.questions.map((q, idx) => (
              <div key={q.id} className="text-sm p-3 bg-gray-50 rounded border border-gray-100 text-gray-600">
                <span className="font-bold text-blue-500 mr-2">Q{idx + 1}.</span>
                {q.text}
              </div>
            ))}
          </div>
        </div>

        <button 
          onClick={() => onStart(randomize)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-md transition-transform transform active:scale-95 flex items-center justify-center text-lg"
        >
          <Play size={24} className="mr-2 fill-current" />
          テストを開始する
        </button>
      </div>
    </div>
  );
};

// 5. Game Loop View
const GameView = ({ quiz, isRandom, onFinish }) => {
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState([]); // { questionId, selectedIndex, timeTaken }
  const [startTime, setStartTime] = useState(null);
  const [qStartTime, setQStartTime] = useState(null);

  // 実際の出題順序を決定
  const questionOrder = useMemo(() => {
    let order = [...quiz.questions];
    if (isRandom) {
      order = order.sort(() => Math.random() - 0.5);
    }
    return order;
  }, [quiz, isRandom]);

  useEffect(() => {
    setStartTime(Date.now());
    setQStartTime(Date.now());
  }, []);

  useEffect(() => {
    // 問題が変わるたびに計測開始
    setQStartTime(Date.now());
  }, [currentQIndex]);

  const handleAnswer = (optionIndex) => {
    const now = Date.now();
    const currentQ = questionOrder[currentQIndex];
    
    const answerRecord = {
      question: currentQ,
      selectedIndex: optionIndex,
      isCorrect: optionIndex === currentQ.correctIndex,
      timeTaken: now - qStartTime
    };

    const newAnswers = [...answers, answerRecord];
    setAnswers(newAnswers);

    if (currentQIndex < questionOrder.length - 1) {
      setCurrentQIndex(prev => prev + 1);
    } else {
      // Finish
      const totalTime = now - startTime;
      onFinish(newAnswers, totalTime);
    }
  };

  const currentQuestion = questionOrder[currentQIndex];
  const progress = ((currentQIndex) / questionOrder.length) * 100;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-500 mb-1">
          <span>Question {currentQIndex + 1} / {questionOrder.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-4 leading-relaxed whitespace-pre-line">
          {currentQuestion.text}
        </h2>

        {/* 表データがある場合は表示 */}
        {currentQuestion.tableData && (
          <div className="mb-8">
            <SimpleTable data={currentQuestion.tableData} />
          </div>
        )}
        
        {/* 通常の間隔調整（表がない場合用） */}
        {!currentQuestion.tableData && <div className="mb-8"></div>}

        <div className="space-y-4">
          {currentQuestion.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswer(idx)}
              className="w-full text-left p-4 rounded-xl border-2 border-gray-100 hover:border-blue-500 hover:bg-blue-50 transition-all group flex items-center"
            >
              <span className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-bold mr-4 group-hover:bg-blue-500 group-hover:text-white transition-colors flex-shrink-0">
                {['ア', 'イ', 'ウ', 'エ'][idx]}
              </span>
              <span className="text-gray-700 font-medium">{option}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// 6. Result View
const ResultView = ({ resultData, onRetry, onBackToMenu }) => {
  const { answers, totalTime } = resultData;
  const correctCount = answers.filter(a => a.isCorrect).length;
  const totalCount = answers.length;
  const accuracy = Math.round((correctCount / totalCount) * 100);
  const formattedTime = `${Math.floor(totalTime / 1000)}秒`;

  // 評価コメント
  let comment = "もう一歩！";
  let color = "text-yellow-500";
  if (accuracy === 100) {
    comment = "パーフェクト！完璧だ！";
    color = "text-green-500";
  } else if (accuracy >= 80) {
    comment = "素晴らしい！合格圏内だ。";
    color = "text-blue-500";
  } else if (accuracy < 50) {
    comment = "もう少し復習が必要かも。";
    color = "text-red-500";
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="p-8 text-center bg-gray-50 border-b border-gray-200">
        <h2 className="text-lg text-gray-500 font-bold mb-2">RESULT</h2>
        <div className={`text-4xl font-black mb-2 ${color}`}>{accuracy}%</div>
        <p className="text-2xl font-bold text-gray-800 mb-4">{correctCount} / {totalCount} 問正解</p>
        <p className="text-gray-600 font-medium mb-4">{comment}</p>
        
        <div className="flex justify-center items-center text-gray-500 text-sm">
          <Clock size={16} className="mr-1" /> かかった時間: {formattedTime}
        </div>
      </div>

      <div className="p-6 bg-gray-50/50">
        <h3 className="font-bold text-gray-700 mb-4">詳細レポート</h3>
        <div className="space-y-4">
          {answers.map((ans, idx) => (
            <div key={idx} className={`bg-white p-4 rounded-lg border-l-4 shadow-sm ${ans.isCorrect ? 'border-green-500' : 'border-red-500'}`}>
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-sm text-gray-500">Q{idx + 1}</span>
                {ans.isCorrect ? 
                  <span className="flex items-center text-green-600 text-sm font-bold"><CheckCircle size={16} className="mr-1"/> 正解</span> : 
                  <span className="flex items-center text-red-600 text-sm font-bold"><XCircle size={16} className="mr-1"/> 不正解</span>
                }
              </div>
              <p className="text-gray-800 font-medium mb-2 whitespace-pre-line">{ans.question.text}</p>
              
              {/* 結果画面でも表を表示 */}
              {ans.question.tableData && (
                <div className="mb-4">
                  <SimpleTable data={ans.question.tableData} />
                </div>
              )}

              <div className="text-sm grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                <div className={`p-2 rounded ${ans.isCorrect ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                  <span className="text-xs opacity-70 block">あなたの回答</span>
                  {['ア', 'イ', 'ウ', 'エ'][ans.selectedIndex]}. {ans.question.options[ans.selectedIndex]}
                </div>
                {!ans.isCorrect && (
                  <div className="bg-blue-50 text-blue-800 p-2 rounded">
                    <span className="text-xs opacity-70 block">正解</span>
                    {['ア', 'イ', 'ウ', 'エ'][ans.question.correctIndex]}. {ans.question.options[ans.question.correctIndex]}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 border-t border-gray-200 flex flex-col sm:flex-row gap-4 justify-center bg-white sticky bottom-0">
        <button 
          onClick={onRetry}
          className="flex-1 bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center transition-colors"
        >
          <RotateCcw size={18} className="mr-2" /> もう一度挑戦
        </button>
        <button 
          onClick={onBackToMenu}
          className="flex-1 bg-white border-2 border-gray-300 text-gray-700 font-bold py-3 px-6 rounded-lg hover:bg-gray-50 flex items-center justify-center transition-colors"
        >
          <ArrowLeft size={18} className="mr-2" /> メニューに戻る
        </button>
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---

export default function App() {
  const [view, setView] = useState('home'); // home, course, quiz_menu, quiz_play, result
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [gameSettings, setGameSettings] = useState({ randomize: false });
  const [resultData, setResultData] = useState(null);

  // Navigation Handlers
  const goHome = () => {
    setView('home');
    setSelectedCourse(null);
    setSelectedQuiz(null);
    setResultData(null);
  };

  const selectCourse = (course) => {
    setSelectedCourse(course);
    setView('course');
  };

  const selectQuiz = (quiz) => {
    setSelectedQuiz(quiz);
    setView('quiz_menu');
  };

  const startQuiz = (randomize) => {
    setGameSettings({ randomize });
    setView('quiz_play');
  };

  const finishQuiz = (answers, totalTime) => {
    setResultData({ answers, totalTime });
    setView('result');
  };

  // Breadcrumb Path Generator
  const getPath = () => {
    const path = [];
    if (selectedCourse) {
      path.push({ title: selectedCourse.title, id: selectedCourse.id, type: 'course' });
    }
    if (selectedQuiz && view !== 'course') {
      path.push({ title: selectedQuiz.title, id: selectedQuiz.id, type: 'quiz_menu' });
    }
    return path;
  };

  const handleBreadcrumbNavigate = (type, id) => {
    if (type === 'home') goHome();
    if (type === 'course') {
      setView('course');
      setSelectedQuiz(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-800">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2" onClick={goHome} role="button">
            <div className="bg-blue-600 text-white p-1.5 rounded-lg">
              <FileText size={20} />
            </div>
            <h1 className="text-xl font-black tracking-tight text-gray-900">Study Master</h1>
          </div>
          <div className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
            Test Prep Mode
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 pb-20">
        {/* Navigation Breadcrumbs */}
        {view !== 'home' && (
          <Breadcrumbs path={getPath()} onNavigate={handleBreadcrumbNavigate} />
        )}

        {/* View Switcher */}
        <div className="animate-fade-in">
          {view === 'home' && (
            <>
              <h2 className="text-2xl font-bold mb-6 text-gray-800">科目の選択</h2>
              <FolderListView courses={DATA} onSelectCourse={selectCourse} />
            </>
          )}

          {view === 'course' && selectedCourse && (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800">{selectedCourse.title}</h2>
                <p className="text-gray-500">{selectedCourse.description}</p>
              </div>
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">テスト一覧</h3>
              <QuizListView course={selectedCourse} onSelectQuiz={selectQuiz} />
            </>
          )}

          {view === 'quiz_menu' && selectedQuiz && (
            <QuizMenuView quiz={selectedQuiz} onStart={startQuiz} />
          )}

          {view === 'quiz_play' && selectedQuiz && (
            <GameView 
              quiz={selectedQuiz} 
              isRandom={gameSettings.randomize} 
              onFinish={finishQuiz} 
            />
          )}

          {view === 'result' && resultData && (
            <ResultView 
              resultData={resultData} 
              onRetry={() => startQuiz(gameSettings.randomize)}
              onBackToMenu={() => setView('course')} 
            />
          )}
        </div>
      </main>
    </div>
  );
}