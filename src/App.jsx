import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Folder, FileText, ChevronRight, Play, Settings, Clock, 
  CheckCircle, XCircle, RotateCcw, Home, ArrowLeft, Layers, 
  Brain, Target, Trash2, Lock, Shuffle, Moon, Sun, Monitor, 
  GraduationCap, Plus, Edit3, Image as ImageIcon, X, Save, Type, List,
  BookOpen, Zap, CheckSquare, MinusCircle, PlusCircle, Bell, Info
} from 'lucide-react';

const APP_VERSION = "v2.1.0";

// ==========================================
// INITIAL DATA (DEFAULT)
// ==========================================
const INITIAL_DATA = [
  {
    id: 'course-info-process-2',
    title: '情報処理入門２',
    description: '2025年度 後期',
    quizzes: [
      {
        "id": "quiz-1",
        "title": "第1回 小テスト",
        "description": "全4問",
        "questions": [
          {
            "id": "q1-1",
            "text": "1.5Mビット/秒の伝送路を用いて12Mバイトのデータを転送するために必要な伝送時間は何秒か。ここで、伝送路の伝送効率を50%とする。(H30秋)",
            "type": "multiple",
            "options": ["16", "32", "64", "128"],
            "correctAnswer": ["128"] // 配列で統一
          },
          {
            "id": "q1-2",
            "text": "100Mビット/秒のLANを使用し、1件のレコード長が1,000バイトの電文を1,000件連続して伝送するとき、伝送時間は何秒か。ここで、LANの伝送効率は50%とする。(R3)",
            "type": "multiple",
            "options": ["0.02", "0.08", "0.16", "1.6"],
            "correctAnswer": ["0.16"]
          },
          {
            "id": "q1-3",
            "text": "10Mビット/秒の回線で接続された端末間で、平均1Mバイトのファイルを、10秒ごとに転送するときの回線利用率は何%か。ここで、ファイル転送時には、転送量の20%が制御情報として付加されるものとし、1Mビット=10^6ビットとする。(R1秋)",
            "type": "multiple",
            "options": ["1.2", "6.4", "8.0", "9.6"],
            "correctAnswer": ["9.6"]
          },
          {
            "id": "q1-4",
            "text": "符号化速度が192kビット/秒の音声データ2.4Mバイトを、通信速度が128kビット/秒のネットワークを用いてダウンロードしながら途切れることなく再生するには、再生開始前のデータのバッファリング時間として最低何秒間が必要か。(H29秋)",
            "type": "multiple",
            "options": ["50", "100", "150", "250"],
            "correctAnswer": ["50"]
          }
        ]
      },
      {
        "id": "quiz-2",
        "title": "第2回 小テスト",
        "description": "全4問",
        "questions": [
          {
            "id": "q2-1",
            "text": "OSI基本参照モデルにおいて、エンドシステム間のデータ伝送の中継と経路制御の機能をもつ層はどれか。(H24)",
            "type": "multiple",
            "options": ["セッション層", "データリンク層", "トランスポート層", "ネットワーク層"],
            "correctAnswer": ["ネットワーク層"]
          },
          {
            "id": "q2-2",
            "text": "OSI基本参照モデルの各層で中継する装置を、物理層で中継する装置、データリンク層で中継する装置、ネットワーク層で中継する装置の順に並べたものはどれか。(R3)",
            "type": "multiple",
            "options": ["ブリッジ, リピータ, ルータ", "ブリッジ, ルータ, リピータ", "リピータ, ブリッジ, ルータ", "リピータ, ルータ, ブリッジ"],
            "correctAnswer": ["リピータ, ブリッジ, ルータ"]
          },
          {
            "id": "q2-3",
            "text": "イーサネットで使用されるメディアアクセス制御方式であるCSMA/CDに関する記述として、適切なものはどれか。(R2秋)",
            "type": "multiple",
            "options": ["それぞれのステーションがキャリア検知を行うとともに、送信データの衝突が起きた場合は再送する。", "タイムスロットと呼ばれる単位で分割して、同一周波数において複数の通信を可能にする。", "データ送受信の開始時にデータ送受信のネゴシエーションとしてRTS/CTS方式を用い、受信の確認はACKを使用する。", "伝送路上にトークンを巡回させ、トークンを受け取った端末だけがデータ送信できる。"],
            "correctAnswer": ["それぞれのステーションがキャリア検知を行うとともに、送信データの衝突が起きた場合は再送する。"]
          },
          {
            "id": "q2-4",
            "text": "ルータの機能に関する記述のうち、適切なものはどれか。(R4秋)",
            "type": "multiple",
            "options": ["MACアドレステーブルの登録情報によって、データフレームをあるポートだけに中継するか、全てのポートに中継するか判断する。", "OSI基本参照モデルのデータリンク層において、ネットワーク同士を接続する。", "OSI基本参照モデルのトランスポート層からアプリケーション層までの階層で、プロトコルの変換を行う。", "伝送媒体やアクセス制御方式の異なるネットワークの接続が可能であり、送信データのIPアドレスを識別し、データの転送経路を決定する。"],
            "correctAnswer": ["伝送媒体やアクセス制御方式の異なるネットワークの接続が可能であり、送信データのIPアドレスを識別し、データの転送経路を決定する。"]
          }
        ]
      },
      {
        "id": "quiz-3",
        "title": "第3回 小テスト",
        "description": "全4問",
        "questions": [
          {
            "id": "q3-1",
            "text": "TCP/IP階層モデルにおいて、TCPが属する層はどれか。(H23秋)",
            "type": "multiple",
            "options": ["アプリケーション層", "インターネット層", "トランスポート層", "リンク層"],
            "correctAnswer": ["トランスポート層"]
          },
          {
            "id": "q3-2",
            "text": "次のネットワークアドレスとサブネットマスクをもつネットワークがある。このネットワークをあるPCが利用する場合、そのPCに割り振ってはいけないIPアドレスはどれか。\nネットワークアドレス: 200.170.70.16\nサブネットマスク: 255.255.255.240",
            "type": "multiple",
            "options": ["200.170.70.17", "200.170.70.20", "200.170.70.30", "200.170.70.31"],
            "correctAnswer": ["200.170.70.31"]
          },
          {
            "id": "q3-3",
            "text": "クライアントAがポート番号8080のHTTPプロキシサーバBを経由してポート番号80のWebサーバCにアクセスしているとき、宛先ポート番号が常に8080になるTCPパケットはどれか。(R1秋)",
            "type": "multiple",
            "options": ["AからBへのHTTP要求及びCからBへのHTTP応答。", "AからBへのHTTP要求だけ。", "BからAへのHTTP要求だけ。", "BからCへのHTTP要求及びCからBへのHTTP応答。"],
            "correctAnswer": ["AからBへのHTTP要求だけ。"]
          },
          {
            "id": "q3-4",
            "text": "DHCPの説明として、適切なものはどれか。(R3)",
            "type": "multiple",
            "options": ["IPアドレスの設定を自動化するためのプロトコルである。", "ディレクトリサービスにアクセスするためのプロトコルである。", "電子メールを転送するためのプロトコルである。", "プライベートIPアドレスをグローバルIPアドレスに変換するためのプロトコルである。"],
            "correctAnswer": ["IPアドレスの設定を自動化するためのプロトコルである。"]
          }
        ]
      },
      {
        "id": "quiz-5",
        "title": "第5回 小テスト",
        "description": "全4問",
        "questions": [
          {
            "id": "q5-1",
            "text": "LANに接続されているプリンターのMACアドレスを, 同一LAN上のPCから調べるときに使用するコマンドはどれか。ここで, PCはこのプリンターを直前に使用しており, プリンターのIPアドレスは分かっているものとする。(H30春)",
            "type": "multiple",
            "options": ["arp", "ipconfig", "netstat", "ping"],
            "correctAnswer": ["arp"]
          },
          {
            "id": "q5-2",
            "text": "ONF (Open Networking Foundation) が標準化を進めているOpenFlowプロトコルを用いたSDN (Software-Defined Networking) の説明として, 適切なものはどれか。(R4)",
            "type": "multiple",
            "options": ["管理ステーションから定期的にネットワーク機器のMIB (Management Information Base) 情報を取得して, 稼働監視や性能管理を行うためのネットワーク管理手法", "データ転送機能をもつネットワーク機器同士が経路情報を交換して, ネットワーク全体のデータ転送経路を決定する方式", "ネットワーク制御機能とデータ転送機能を実装したソフトウェアを, 仮想環境で利用するための技術", "ネットワーク制御機能とデータ転送機能を論理的に分離し, コントローラと呼ばれるソフトウェアで, データ転送機能をもつネットワーク機器の集中制御を可能とするアーキテクチャ"],
            "correctAnswer": ["ネットワーク制御機能とデータ転送機能を論理的に分離し, コントローラと呼ばれるソフトウェアで, データ転送機能をもつネットワーク機器の集中制御を可能とするアーキテクチャ"]
          },
          {
            "id": "q5-3",
            "text": "SMTPの説明として, 適切なものはどれか。(H17秋)",
            "type": "multiple",
            "options": ["Webサーバに格納されている情報をアクセスするためのプロトコルである。", "電子化された文字, 図形, イメージが混在した文書の作成や編集を行うシステムである。", "電子メールを転送するためのプロトコルである。", "文書の構造表現が可能な文書記述用言語の一つである。"],
            "correctAnswer": ["電子メールを転送するためのプロトコルである。"]
          },
          {
            "id": "q5-4",
            "text": "Webサーバにおいて, クライアントからの要求に応じてアプリケーションプログラムを実行して, その結果をWebブラウザに返すなどのインタラクティブなページを実現するために, Webサーバと外部プログラムを連携させる仕組みはどれか。(H30春)",
            "type": "multiple",
            "options": ["CGI", "HTML", "MIME", "URL"],
            "correctAnswer": ["CGI"]
          }
        ]
      },
      {
        "id": "quiz-6",
        "title": "第6回 小テスト",
        "description": "全4問",
        "questions": [
          {
            "id": "q6-1",
            "text": "スパイウェアに該当するものはどれか。(H28春)",
            "type": "multiple",
            "options": ["Webサイトへの不正な入力を排除するために, Webサイトの入力フォームの入力データから, HTMLタグ, JavaScript, SQL文などを検出し, それらを他の文字列に置き換えるプログラム", "サーバへの侵入口となる脆弱なポートを探すために, 攻撃者のPCからサーバのTCPポートに順にアクセスするプログラム", "利用者の意図に反してPCにインストールされ, 利用者の個人情報やアクセス履歴などの情報を収集するプログラム", "利用者のパスワードを調べるために, サーバにアクセスし, 辞書に載っている単語を総当たりで試すプログラム"],
            "correctAnswer": ["利用者の意図に反してPCにインストールされ, 利用者の個人情報やアクセス履歴などの情報を収集するプログラム"]
          },
          {
            "id": "q6-2",
            "text": "マルウェアについて, トロイの木馬とワームを比較したとき, ワームの特徴はどれか。(H29秋)",
            "type": "multiple",
            "options": ["勝手にファイルを暗号化して正常に読めなくする", "単独のプログラムとして不正な動作を行う", "特定の条件になるまで活動できずに待機する", "ネットワークやリムーバブルメディアを媒介として自ら感染を広げる"],
            "correctAnswer": ["ネットワークやリムーバブルメディアを媒介として自ら感染を広げる"]
          },
          {
            "id": "q6-3",
            "text": "SQLインジェクション攻撃の説明として, 適切なものはどれか。(R2)",
            "type": "multiple",
            "options": ["Webアプリケーションのデータ操作言語の呼び出し方に不備がある場合に, 攻撃者が悪意をもって構成した文字列を入力することによって, データベースのデータの不正な取得, 改ざん及び削除をする攻撃", "Webサイトに対して, 他のサイトを介して大量のパケットを送り付け, そのネットワークトラフィックの異常を高めてサービスを提供不能にする攻撃", "確保されているメモリ空間の下限又は上限を超えてデータの書き込みと読み出しを行うことによって, プログラムを異常終了させたりデータエリアに挿入された不正なコードを実行させたりする攻撃", "攻撃者が罠を仕掛けたWebページを利用者が閲覧し, 当該ページ内のリンクをクリックしたときに, 不正スクリプトを含む文字列が脆弱なWebサーバに送り込まれ, レスポンスに埋め込まれた不正スクリプトの実行によって, 情報漏洩をもたらす攻撃"],
            "correctAnswer": ["Webアプリケーションのデータ操作言語の呼び出し方に不備がある場合に, 攻撃者が悪意をもって構成した文字列を入力することによって, データベースのデータの不正な取得, 改ざん及び削除をする攻撃"]
          },
          {
            "id": "q6-4",
            "text": "攻撃者が用意したサーバXのIPアドレスが, A社WebサーバのFQDNに対応するIPアドレスとして, B社DNSキャッシュサーバに記憶された。これによって, 意図せずサーバXに誘導されてしまう利用者はどれか。ここで, A社, B社の従業員は自社のDNSキャッシュサーバを利用して名前解決を行う。(R1)",
            "type": "multiple",
            "options": ["A社WebサーバにアクセスしようとするA社従業員", "A社WebサーバにアクセスしようとするB社従業員", "B社WebサーバにアクセスしようとするA社従業員", "B社WebサーバにアクセスしようとするB社従業員"],
            "correctAnswer": ["A社WebサーバにアクセスしようとするB社従業員"]
          }
        ]
      },
      {
        "id": "quiz-7",
        "title": "第7回 小テスト",
        "description": "全4問",
        "questions": [
          {
            "id": "q7-1",
            "text": "ファイアウォールのパケットフィルタリング機能を利用して実現できるものはどれか。(H18春)",
            "type": "multiple",
            "options": ["インターネットから受け取ったパケットに改ざんがある場合は修正し, 改ざんが修正できない場合には, ログを取って内部ネットワークへの通過を阻止する", "インターネットから受け取ったパケットのヘッダー部分及びデータ部分に, 改ざんがあるかどうかをチェックし, 改ざんがあった場合にはそのパケットを除去する", "動的に割り当てられたTCPポート番号をもったパケットを, 受信側で固定値のTCPポート番号をもったパケットに変更して, 内部のネットワークへの通過を許可する", "特定のTCPポート番号をもったパケットだけに, インターネットから内部ネットワークへの通過を許可する"],
            "correctAnswer": ["特定のTCPポート番号をもったパケットだけに, インターネットから内部ネットワークへの通過を許可する"]
          },
          {
            "id": "q7-2",
            "text": "WAFの説明はどれか。(H28秋)",
            "type": "multiple",
            "options": ["Webアクセスに対するアクセス内容を監視し, 攻撃とみなされるパターンを検知したときに当該するアクセスを遮断する", "Wi-Fiアライアンスが認定した無線LANの暗号化方式の規格であり, AES暗号に対応している", "様々なシステムの動作ログを一元的に蓄積, 管理し, セキュリティ上の脅威となる事象をいち早く検知, 分析する", "ファイアウォール機能を有し, ウイルス対策, 侵入検知などを連携させ, 複数のセキュリティ機能を統合的に管理する"],
            "correctAnswer": ["Webアクセスに対するアクセス内容を監視し, 攻撃とみなされるパターンを検知したときに当該するアクセスを遮断する"]
          },
          {
            "id": "q7-3",
            "text": "公開鍵暗号方式の用法に関する記述のうち, 送信者が間違いなく本人であることを受信者が確認できるのはどれか。(H17春)",
            "type": "multiple",
            "options": ["送信者は自分の公開鍵で暗号化し, 受信者は自分の秘密鍵で復号する", "送信者は自分の秘密鍵で暗号化し, 受信者は送信者の公開鍵で復号する", "送信者は受信者の公開鍵で暗号化し, 受信者は自分の秘密鍵で復号する", "送信者は受信者の秘密鍵で暗号化し, 受信者は自分の公開鍵で復号する"],
            "correctAnswer": ["送信者は自分の秘密鍵で暗号化し, 受信者は送信者の公開鍵で復号する"]
          },
          {
            "id": "q7-4",
            "text": "メッセージにRSA方式のデジタル署名を付与して2者間で送受信する。そのときのデジタル署名の検証鍵と使用方法はどれか。(R1秋)",
            "type": "multiple",
            "options": ["受信者の公開鍵であり, 送信者がメッセージダイジェストからデジタル署名を作成する際に使用する", "受信者の秘密鍵であり, 受信者がデジタル署名からメッセージダイジェストを算出する際に使用する", "送信者の公開鍵であり, 受信者がデジタル署名からメッセージダイジェストを算出する際に使用する", "送信者の秘密鍵であり, 送信者がメッセージダイジェストからデジタル署名を作成する際に使用する"],
            "correctAnswer": ["送信者の公開鍵であり, 受信者がデジタル署名からメッセージダイジェストを算出する際に使用する"]
          }
        ]
      },
      {
        "id": "quiz-8",
        "title": "第8回 小テスト",
        "description": "全4問",
        "questions": [
          {
            "id": "q8-1",
            "text": "リスクアセスメントを構成するプロセスの組み合わせはどれか。(H29秋)",
            "type": "multiple",
            "options": ["リスク特定, リスク評価, リスク受容", "リスク特定, リスク分析, リスク評価", "リスク分析, リスク対応, リスク受容", "リスク分析, リスク評価, リスク対応"],
            "correctAnswer": ["リスク特定, リスク分析, リスク評価"]
          },
          {
            "id": "q8-2",
            "text": "リスク対応のうち, リスクファイナンシングに該当するものはどれか。(H31春)",
            "type": "multiple",
            "options": ["システムが被害を受けるリスクを想定して, 保険を掛ける。", "システムの被害につながるリスクの顕在化を抑える対策に資金を投入する。", "リスクが大きいと評価されたシステムを廃止し, 新たなセキュアなシステムの構築に資金を投入する。", "リスクが顕在化した場合のシステムの被害を小さくする設備に資金を投入する。"],
            "correctAnswer": ["システムが被害を受けるリスクを想定して, 保険を掛ける。"]
          },
          {
            "id": "q8-3",
            "text": "ペネトレーションテストに該当するものはどれか。(R6)",
            "type": "multiple",
            "options": ["検査対象の実行プログラムの設計書, ソースコードに着目し, 開発プロセスの各程にセキュリティ上の問題がないかどうかをツールや目視で確認する。", "公開Webサーバの各コンテンツファイルのハッシュ値を管理し, 定期的に各ファイルから生成したハッシュ値と一致するかどうかを確認する。", "公開Webサーバや組織のネットワークの脆弱性を探索し, サーバに実際に侵入できるかどうかを確認する。", "内部ネットワークのサーバやネットワーク機器のIPFIX情報から, 各PCの通信に異常な振る舞いがないかどうかを確認する。"],
            "correctAnswer": ["公開Webサーバや組織のネットワークの脆弱性を探索し, サーバに実際に侵入できるかどうかを確認する。"]
          },
          {
            "id": "q8-4",
            "text": "ファジングで得られるセキュリティ上の効果はどれか。(H31春)",
            "type": "multiple",
            "options": ["ソフトウェアの脆弱性を自動的に修正できる。", "ソフトウェアの脆弱性を検出できる。", "複数のログデータを相関分析し, 不正アクセスを検知できる。", "利用者IDを統合的に管理し, 統一したパスワードポリシーを適用できる。"],
            "correctAnswer": ["ソフトウェアの脆弱性を検出できる。"]
          }
        ]
      },
      {
        "id": "quiz-9",
        "title": "第9回 小テスト",
        "description": "全4問",
        "questions": [
          {
            "id": "q9-1",
            "text": "デジタルフォレンジックスの説明として, 適切なものはどれか。(R3)",
            "type": "multiple",
            "options": ["あらかじめ設定した運用基準に従って, メールサーバを通過する送受信メールをフィルタリングすること", "外部からの攻撃や不正なアクセスからサーバを防御すること", "磁気ディスクなどの書き換え可能な記憶媒体を単に初期化するだけではデータを復元できる可能性があるので, 任意のデータ列で上書きすること", "不正アクセスなどコンピュータに関する犯罪の法的な証拠性を確保できるように, 原因究明に必要な情報を保全, 収集, 分析をすること"],
            "correctAnswer": ["不正アクセスなどコンピュータに関する犯罪の法的な証拠性を確保できるように, 原因究明に必要な情報を保全, 収集, 分析をすること"]
          },
          {
            "id": "q9-2",
            "text": "HTTPS (HTTP over SSL/TLS) の機能を用いて実現できるものはどれか。(H26秋)",
            "type": "multiple",
            "options": ["SQLインジェクションによるWebサーバへの攻撃を防ぐ。", "TCPポート80番と443番以外の通信を遮断する。", "Webサーバとブラウザの間の通信を暗号化する。", "Webサーバへの不正なアクセスをネットワーク層でのパケットフィルタリングによって制限する。"],
            "correctAnswer": ["Webサーバとブラウザの間の通信を暗号化する。"]
          },
          {
            "id": "q9-3",
            "text": "インターネットに接続された利用者のPCから, DMZ上の公開Webサイトにアクセスし, 利用者の個人情報を入力すると, その個人情報が内部ネットワークのデータベース (DB) サーバに蓄積されるシステムがある。このシステムにおいて, 利用者個人のデジタル証明書を用いたTLS通信を行うことによって期待できるセキュリティ上の効果はどれか。(R2)",
            "type": "multiple",
            "options": ["PCとDBサーバ間の通信データを暗号化するとともに, 正当なDBサーバであるかを検証することができるようになる。", "PCとDBサーバ間の通信データを暗号化するとともに, 利用者を認証することができるようになる。", "PCとWebサーバ間の通信データを暗号化するとともに, 正当なDBサーバであるかを検証することができるようになる。", "PCとWebサーバ間の通信データを暗号化するとともに, 利用者を認証することができるようになる。"],
            "correctAnswer": ["PCとWebサーバ間の通信データを暗号化するとともに, 利用者を認証することができるようになる。"]
          },
          {
            "id": "q9-4",
            "text": "電子メールに用いられるS/MIMEの機能はどれか。(H20春)",
            "type": "multiple",
            "options": ["内容の圧縮", "内容の暗号化と署名", "内容の開封通知", "内容の再送"],
            "correctAnswer": ["内容の暗号化と署名"]
          }
        ]
      },
      {
        "id": "quiz-10",
        "title": "第10回 小テスト",
        "description": "全4問",
        "questions": [
          {
            "id": "q10-1",
            "text": "関係モデルとその実装である関係データベースの対応に関する記述のうち, 適切なものはどれか。(R2)",
            "type": "multiple",
            "options": ["関係は, 表に対応付けられる", "属性も列も, 左から右に順序付けられる", "タプルも行も, ともに重複しない", "定義域は, 文字型又は文字列型に対応付けられる"],
            "correctAnswer": ["関係は, 表に対応付けられる"]
          },
          {
            "id": "q10-2",
            "text": "DBMSにおいて, スキーマを決める機能はどれか。(H27秋)",
            "type": "multiple",
            "options": ["機密保護機能", "障害回復機能", "定義機能", "保全機能"],
            "correctAnswer": ["定義機能"]
          },
          {
            "id": "q10-3",
            "text": "DBMSが, 3層スキーマアーキテクチャを採用する目的として, 適切なものはどれか。(H27春)",
            "type": "multiple",
            "options": ["関係演算によって元の表から新たな表を導出し, それが実在しているように見せる。", "対話的に使われるSQL文を, アプリケーションプログラムからも使えるようにする。", "データの物理的な格納構造を変更しても, アプリケーションプログラムに影響が及ばないようにする。", "プログラム言語を限定して, アプリケーションプログラムとDBMSを緊密に結合する。"],
            "correctAnswer": ["データの物理的な格納構造を変更しても, アプリケーションプログラムに影響が及ばないようにする。"]
          },
          {
            "id": "q10-4",
            "text": "データベースを記録媒体にどのように格納するかを記述したものはどれか。(H18秋)",
            "type": "multiple",
            "options": ["概念スキーマ", "外部スキーマ", "サブスキーマ", "内部スキーマ"],
            "correctAnswer": ["内部スキーマ"]
          }
        ]
      },
      {
        "id": "quiz-11",
        "title": "第11回 小テスト",
        "description": "全4問",
        "questions": [
          {
            "id": "q11-1",
            "text": "データモデルにおいて, データの関係を木構造で表すものはどれか。(H17秋)",
            "type": "multiple",
            "options": ["E-Rモデル", "階層モデル", "関係モデル", "ネットワークモデル"],
            "correctAnswer": ["階層モデル"]
          },
          {
            "id": "q11-2",
            "text": "関係データモデルにおいて, 属性が取り得る値の集合を意味する用語はどれか。(H18秋)",
            "type": "multiple",
            "options": ["関係 (リレーション)", "実現値", "タプル (組)", "定義域"],
            "correctAnswer": ["定義域"]
          },
          {
            "id": "q11-3",
            "text": "データベースの概念設計に用いられ, 対象世界を, 実体と実体間の関連という2つの概念で表現するデータモデルはどれか。(H20秋)",
            "type": "multiple",
            "options": ["E-Rモデル", "階層モデル", "関係モデル", "ネットワークモデル"],
            "correctAnswer": ["E-Rモデル"]
          },
          {
            "id": "q11-4",
            "text": "E-R図に関する記述として, 適切なものはどれか。(H28秋)",
            "type": "multiple",
            "options": ["関係データベースの表として実装することを前提に表現する", "業務で扱う情報をエンティティ及びエンティティ間のリレーションシップとして表現する", "データの生成から消滅に至るデータ操作を表現する", "リレーションシップは, 業務上の手順を表現する"],
            "correctAnswer": ["業務で扱う情報をエンティティ及びエンティティ間のリレーションシップとして表現する"]
          }
        ]
      },
      {
        "id": "quiz-12",
        "title": "第12回 小テスト",
        "description": "全4問",
        "questions": [
          {
            "id": "q12-1",
            "text": "SQL文において FOREIGN KEY と REFERENCES を用いて指定する制約はどれか。(H29秋)",
            "type": "multiple",
            "options": ["キー制約", "検査制約", "参照制約", "表明"],
            "correctAnswer": ["参照制約"]
          },
          {
            "id": "q12-2",
            "text": "関係データベースにおいて, 外部キーを定義する目的として, 適切なものはどれか。(H28春)",
            "type": "multiple",
            "options": ["関連する相互のテーブルにおいて, レコード間の参照一貫性が維持される制約をもたせる。", "関連する相互テーブルの格納場所を近くに配置することによって, 検索, 更新を高速に行う。", "障害によって破壊されたレコードを, テーブル間の相互の関係から可能な限り復旧させる。", "レコードの削除, 追加の繰返しによる, レコードの格納エリアのフラグメンテーションを防止する。"],
            "correctAnswer": ["関連する相互のテーブルにおいて, レコード間の参照一貫性が維持される制約をもたせる。"]
          },
          {
            "id": "q12-3",
            "text": "関係データベースの主キー制約の条件として, キー値が重複していないことの他に, 主キーを構成する列に必要な条件はどれか。(H25秋)",
            "type": "multiple",
            "options": ["キー値が空でないこと", "構成する列が1つであること", "表の先頭に定義されている列であること", "別の表の候補キーとキー値が一致していること"],
            "correctAnswer": ["キー値が空でないこと"]
          },
          {
            "id": "q12-4",
            "text": "関係データベースの主キーの性質として, 適切なものはどれか。(H21秋)",
            "type": "multiple",
            "options": ["主キーとした列に対して検索条件を指定しなければ, 行の検索はできない。", "数値型の列を主キーに指定すると, その列は算術演算の対象としては使えない。", "1つの表の中に, 主キーの値が同じ行が複数存在することはできない。", "複数の列からなる主キーを構成することはできない。"],
            "correctAnswer": ["1つの表の中に, 主キーの値が同じ行が複数存在することはできない。"]
          }
        ]
      },
      {
        "id": "quiz-13",
        "title": "第13回 小テスト",
        "description": "全4問",
        "questions": [
          {
            "id": "q13-1",
            "text": "関係データモデルにおいて, 関係から特定の属性だけを取り出す演算はどれか。(R1秋)",
            "type": "multiple",
            "options": ["結合 (Join)", "射影 (Projection)", "選択 (Selection)", "和 (Union)"],
            "correctAnswer": ["射影 (Projection)"]
          },
          {
            "id": "q13-2",
            "text": "関係代数の演算のうち, 関係 R, S の直積 R × S に対応する SELECT 文はどれか。ここで, 関係 R, S を表 R, S に対応させ, 表 R 及び S にそれぞれ行の重複はないものとする。(H28秋)",
            "type": "multiple",
            "options": ["SELECT * FROM R, S", "SELECT * FROM R EXCEPT SELECT * FROM S", "SELECT * FROM R UNION SELECT * FROM S", "SELECT * FROM R INTERSECT SELECT * FROM S"],
            "correctAnswer": ["SELECT * FROM R, S"]
          },
          {
            "id": "q13-3",
            "text": "列 A1-A5 から成る R 表に対する次の SQL 文は, 関係代数のどの演算に対応するか。(H25春)\nSELECT A1, A2, A3 FROM R WHERE A4='a'",
            "type": "multiple",
            "options": ["結合と射影", "差と選択", "選択と射影", "和と射影"],
            "correctAnswer": ["選択と射影"]
          },
          {
            "id": "q13-4",
            "text": "同じ属性から成る関係 R と S がある。R と S の属性値の一部が一致する場合, 関係演算 R - (R - S) と同じ結果が得られるものはどれか。ここで, - は差集合, ∩ は共通集合, ∪ は和集合, × は直積, ÷ は商の演算を表す (H26春)",
            "type": "multiple",
            "options": ["R ∩ S", "R ∪ S", "R × S", "R ÷ S"],
            "correctAnswer": ["R ∩ S"]
          }
        ]
      },
      {
        "id": "quiz-14",
        "title": "第14回 小テスト",
        "description": "全4問",
        "questions": [
          {
            "id": "q14-1",
            "text": "“発注伝票” 表を第三正規形に書き換えたものはどれか。ここで, 下線部はキーを示す (R6)\n発注伝票 (注文番号, 商品番号, 商品名, 注文数量)",
            "type": "multiple",
            "options": ["発注 (注文番号, 注文数量), 商品 (商品番号, 商品名)", "発注 (注文番号, 注文数量), 商品 (注文番号, 商品番号, 商品名)", "発注 (注文番号, 商品番号, 注文数量), 商品 (商品番号, 商品名)", "発注 (注文番号, 商品番号, 注文数量), 商品 (商品番号, 商品名, 注文番号)"],
            "correctAnswer": ["発注 (注文番号, 商品番号, 注文数量), 商品 (商品番号, 商品名)"]
          },
          {
            "id": "q14-2",
            "text": "関係, 注文記録 (注文番号, 注文日, 顧客番号, 顧客名, 商品番号, 商品名, 数量, 販売単価) の属性間に, {注文番号 → 注文日, 注文番号 → 顧客番号, 顧客番号 → 顧客名, {注文番号, 商品番号} → 数量, {注文番号, 商品番号} → 販売単価, 商品番号 → 商品名 } の関係がある。それに基づいて第三正規形までの正規化を行って, “商品”, “顧客”, “注文”, “注文明細” の各関係に分解した。関係 “注文明細” として, 適切なものはどれか。ここで, 実線の下線は主キーを表す。(R3)",
            "type": "multiple",
            "options": ["注文明細 (注文番号, 顧客番号, 商品番号, 数量, 販売単価)", "注文明細 (注文番号, 顧客番号, 数量, 販売単価)", "注文明細 (注文番号, 商品番号, 数量, 販売単価)", "注文明細 (注文番号, 数量, 販売単価)"],
            "correctAnswer": ["注文明細 (注文番号, 商品番号, 数量, 販売単価)"]
          },
          {
            "id": "q14-3",
            "text": "関係を第三正規形まで正規化して設計する目的はどれか。(H26秋)",
            "type": "multiple",
            "options": ["値の重複をなくすことによって, 格納効率を向上させる。", "関係を細かく分解することによって, 整合性制約を排除する。", "冗長性を排除することによって, 更新時異状を回避する。", "属性間の結合度を低下させることによって, 更新時のロック待ちを減らす。"],
            "correctAnswer": ["冗長性を排除することによって, 更新時異状を回避する。"]
          },
          {
            "id": "q14-4",
            "text": "次の表はどこまで正規化されたものか。(R2春)",
            "type": "multiple",
            "options": ["第二正規形", "第三正規形", "第四正規形", "非正規形"],
            "correctAnswer": ["第二正規形"],
            "tableData": [
              { "従業員番号": "12345", "氏名": "情報 太郎", "入社年": "1991", "職位": "部長", "職位手当": "90,000" },
              { "従業員番号": "12346", "氏名": "処理 次郎", "入社年": "2005", "職位": "課長", "職位手当": "50,000" },
              { "従業員番号": "12347", "氏名": "技術 三郎", "入社年": "2007", "職位": "課長", "職位手当": "50,000" }
            ]
          }
        ]
      }
    ]
  }
];

// --- HELPER FUNCTIONS ---

const generateId = () => Math.random().toString(36).substr(2, 9);

const convertImageToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

// --- DATA ADAPTER ---
const normalizeData = (rawData) => {
  if (!rawData || !Array.isArray(rawData)) return [];
  
  return rawData.map(course => ({
    ...course,
    quizzes: (course.quizzes || []).map(quiz => ({
      ...quiz,
      questions: (quiz.questions || []).map(q => {
        let type = q.type || 'multiple';
        let options = [];
        let correctAnswer = [];

        if (Array.isArray(q.options)) {
          options = q.options;
        } else if (typeof q.options === 'object' && q.options !== null) {
           const keys = ['ア', 'イ', 'ウ', 'エ', 'オ', 'カ'];
           options = keys.filter(k => q.options[k]).map(k => q.options[k]);
        }

        if (Array.isArray(q.correctAnswer)) {
          correctAnswer = q.correctAnswer;
        } else {
          if (typeof q.options === 'object' && !Array.isArray(q.options) && q.options !== null) {
             correctAnswer = [q.options[q.correctAnswer] || q.correctAnswer];
          } else {
             correctAnswer = [q.correctAnswer];
          }
        }

        return {
          ...q,
          type,
          correctAnswer: correctAnswer,
          options: options,
          image: q.image || null,
          tableData: q.tableData || q.table_data || null // Handle snake_case from old data
        };
      })
    }))
  }));
};

// --- COMPONENTS ---

const SimpleTable = ({ data }) => {
  if (!data || data.length === 0) return null;
  const headers = Object.keys(data[0]);
  return (
    <div className="overflow-x-auto my-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm text-left">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="px-4 py-2 font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider whitespace-nowrap border-r border-gray-200 dark:border-gray-600 last:border-r-0">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {data.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-750'}>
              {headers.map((h, j) => (
                <td key={j} className="px-4 py-2 text-gray-700 dark:text-gray-300 whitespace-nowrap border-r border-gray-200 dark:border-gray-700 last:border-r-0">
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

const Breadcrumbs = ({ path, onNavigate }) => (
  <nav className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-6 overflow-x-auto whitespace-nowrap pb-2">
    <button onClick={() => onNavigate('home')} className="hover:text-blue-600 dark:hover:text-blue-400 flex items-center transition-colors">
      <Home size={16} className="mr-1" /> Home
    </button>
    {path.map((item, index) => (
      <React.Fragment key={`crumb-${item.type}-${item.id}-${index}`}>
        <ChevronRight size={16} className="mx-2" />
        <button 
          onClick={() => onNavigate(item.type, item.id)}
          className={`hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${index === path.length - 1 ? 'font-bold text-gray-800 dark:text-gray-100' : ''}`}
        >
          {item.title}
        </button>
      </React.Fragment>
    ))}
  </nav>
);

const FolderListView = ({ courses, onSelectCourse, onCreateCourse, onDeleteCourse }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
    {courses.map(course => (
      <div key={course.id} className="relative group">
        <div 
          onClick={() => onSelectCourse(course)}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-700 cursor-pointer transition-all hover:border-blue-300 dark:hover:border-blue-500 flex flex-col items-center justify-center h-48"
        >
          <Folder size={64} className="text-blue-200 dark:text-blue-900 group-hover:text-blue-400 dark:group-hover:text-blue-500 mb-4 transition-colors flex-shrink-0" />
          <div className="w-full text-center">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 leading-tight mb-1 line-clamp-2 px-2">
              {course.title}
            </h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 line-clamp-1 px-2">
              {course.description || 'No description'}
            </p>
          </div>
          <span className="mt-3 text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full">
            {course.quizzes.length} フォルダ
          </span>
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); onDeleteCourse(course.id); }}
          className="absolute top-2 right-2 p-1 bg-gray-100 dark:bg-gray-700 text-gray-400 hover:text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          title="削除"
        >
          <X size={16} />
        </button>
      </div>
    ))}
    <button 
      onClick={onCreateCourse}
      className="bg-gray-50 dark:bg-gray-800/50 border-2 border-dashed border-gray-300 dark:border-gray-700 p-6 rounded-xl flex flex-col items-center justify-center h-48 cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all text-gray-400 dark:text-gray-500 hover:text-blue-500"
    >
      <Plus size={48} className="mb-2" />
      <span className="font-bold">新規フォルダ作成</span>
    </button>
  </div>
);

const QuizListView = ({ course, onSelectQuiz, wrongHistory, onSelectReview, onCreateQuiz, onDeleteQuiz }) => {
  const [mockCount, setMockCount] = useState(10);
  const allQuestions = useMemo(() => course.quizzes.flatMap(quiz => quiz.questions), [course]);
  const totalQ = allQuestions.length;
  const wrongQuestions = allQuestions.filter(q => wrongHistory.includes(q.id));

  const createAllQuestionsQuiz = () => ({
    id: 'all-questions',
    title: '全範囲 総合テスト',
    description: `全${course.quizzes.length}回・計${totalQ}問から全て出題します。`,
    questions: allQuestions,
    isMock: false
  });

  const createMockExamQuiz = () => {
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(mockCount, totalQ));
    return {
      id: 'mock-exam',
      title: `実力診断模試 (${selected.length}問)`,
      description: `全範囲からランダムに${selected.length}問を出題します。`,
      questions: selected,
      isMock: true
    };
  };

  return (
    <div className="space-y-8">
      {totalQ > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center">
            <Layers className="mr-2 text-blue-600 dark:text-blue-400" /> 総合演習メニュー
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border dark:border-gray-600 rounded-lg p-4 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-colors border-blue-100 dark:border-blue-900" onClick={() => onSelectQuiz(createAllQuestionsQuiz())}>
              <h4 className="font-bold text-blue-700 dark:text-blue-400 mb-1">全範囲一括テスト</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">収録された全{totalQ}問を順番に解きます。</p>
            </div>
            <div className="border dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-gray-700 dark:text-gray-200">実力診断模試</h4>
                <span className="text-xs bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded text-gray-600 dark:text-gray-300">ランダム</span>
              </div>
              <div className="flex items-center space-x-3 mb-4">
                <input 
                  type="range" 
                  min="1" max={totalQ} step="1" 
                  value={mockCount} 
                  onChange={(e) => setMockCount(parseInt(e.target.value))}
                  className="flex-grow h-2 bg-gray-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex items-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1">
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{mockCount}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">/{totalQ}</span>
                </div>
              </div>
              <button 
                onClick={() => onSelectQuiz(createMockExamQuiz())}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2 px-4 rounded transition-colors flex items-center justify-center"
              >
                <Target size={16} className="mr-2" /> 模試を開始
              </button>
            </div>
          </div>
        </div>
      )}

      {wrongHistory.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 shadow-sm border border-red-100 dark:border-red-900/50">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-red-800 dark:text-red-300 flex items-center">
              <Brain className="mr-2" /> 弱点克服
            </h3>
            <span className="bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-100 text-xs font-bold px-2 py-1 rounded-full">
              {wrongHistory.length}問
            </span>
          </div>
          <button 
            onClick={() => onSelectReview({
              id: 'review-mode',
              title: '弱点克服リスト',
              description: '過去に間違えた問題を重点的に復習します。',
              questions: wrongQuestions,
              isMock: false
            })}
            className="w-full bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 font-bold py-3 px-6 rounded-lg shadow-sm transition-colors flex items-center justify-center"
          >
            <RotateCcw size={18} className="mr-2" /> 間違えた問題を解き直す
          </button>
        </div>
      )}

      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">問題セット一覧</h3>
          <button onClick={onCreateQuiz} className="text-blue-600 dark:text-blue-400 text-sm font-bold flex items-center hover:underline">
            <Plus size={16} className="mr-1" /> 新規作成
          </button>
        </div>
        
        <div className="grid grid-cols-1 gap-3">
          {course.quizzes.map((quiz, index) => (
            <div 
              key={`${quiz.id}-${index}`}
              className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 cursor-pointer flex items-center justify-between transition-all group"
              onClick={() => onSelectQuiz(quiz)}
            >
              <div className="flex items-center overflow-hidden">
                <div className="bg-yellow-100 dark:bg-yellow-900/50 p-3 rounded-lg mr-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0">
                  <FileText size={24} />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-gray-800 dark:text-gray-100 truncate">{quiz.title}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{quiz.description} ({quiz.questions.length}問)</p>
                </div>
              </div>
              <div className="flex items-center">
                <button 
                  onClick={(e) => { e.stopPropagation(); onDeleteQuiz(quiz.id); }}
                  className="p-2 text-gray-400 hover:text-red-500 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={18} />
                </button>
                <ChevronRight className="text-gray-300 dark:text-gray-600 flex-shrink-0" />
              </div>
            </div>
          ))}
          {course.quizzes.length === 0 && (
            <div className="text-center py-8 text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
              まだ問題セットがありません。<br/>「新規作成」から追加してください。
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CreateCourseModal = ({ onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">フォルダの作成</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">フォルダ名</label>
            <input 
              type="text" 
              className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例: 数学I, 英単語"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">説明（任意）</label>
            <input 
              type="text" 
              className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="例: 2学期中間テスト用"
            />
          </div>
        </div>
        <div className="flex justify-end mt-6 gap-2">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 dark:text-gray-400 font-bold">キャンセル</button>
          <button 
            onClick={() => { if(title) onSave(title, desc); }} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold disabled:opacity-50"
            disabled={!title}
          >
            作成
          </button>
        </div>
      </div>
    </div>
  );
};

const QuizEditor = ({ quiz, onSave, onCancel }) => {
  const [title, setTitle] = useState(quiz ? quiz.title : '');
  const [desc, setDesc] = useState(quiz ? quiz.description : '');
  const [questions, setQuestions] = useState(quiz ? quiz.questions : []);
  const [editingQ, setEditingQ] = useState(null);

  const addQuestion = () => {
    setEditingQ({
      id: generateId(),
      text: '',
      type: 'multiple',
      options: ['', '', '', ''],
      correctAnswer: [],
      image: null
    });
  };

  const saveQuestion = (q) => {
    if (questions.find(Existing => Existing.id === q.id)) {
      setQuestions(questions.map(Existing => Existing.id === q.id ? q : Existing));
    } else {
      setQuestions([...questions, q]);
    }
    setEditingQ(null);
  };

  const deleteQuestion = (id) => {
    if(confirm('この問題を削除しますか？')) {
      setQuestions(questions.filter(q => q.id !== id));
    }
  };

  if (editingQ) {
    return <QuestionEditor question={editingQ} onSave={saveQuestion} onCancel={() => setEditingQ(null)} />;
  }

  return (
    <div className="bg-white dark:bg-gray-800 min-h-screen pb-20">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800 z-10">
        <button onClick={onCancel} className="text-gray-500 hover:text-gray-700 dark:text-gray-400">
          キャンセル
        </button>
        <h2 className="font-bold text-gray-800 dark:text-white">問題セットの編集</h2>
        <button onClick={() => onSave({ title, description: desc, questions })} className="text-blue-600 font-bold">
          保存
        </button>
      </div>
      
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">タイトル</label>
            <input 
              type="text" 
              className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例: 第1章 確認テスト"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">説明</label>
            <input 
              type="text" 
              className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-700 dark:text-gray-300">問題一覧 ({questions.length})</h3>
            <button onClick={addQuestion} className="flex items-center text-sm bg-blue-100 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-200 font-bold">
              <Plus size={16} className="mr-1" /> 追加
            </button>
          </div>
          
          <div className="space-y-3">
            {questions.map((q, idx) => (
              <div key={q.id} className="p-4 border rounded-lg dark:border-gray-600 flex justify-between items-center bg-gray-50 dark:bg-gray-700/50">
                <div className="flex-1 min-w-0 mr-4">
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <span className="font-bold mr-2">Q{idx + 1}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase mr-2 ${q.type === 'input' ? 'bg-purple-100 text-purple-600' : q.type === 'multi-select' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                      {q.type === 'input' ? '記述' : q.type === 'multi-select' ? '複数選択' : '単一選択'}
                    </span>
                    {q.image && <ImageIcon size={12} className="ml-1" />}
                  </div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{q.text}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEditingQ(q)} className="p-2 text-gray-400 hover:text-blue-500">
                    <Edit3 size={18} />
                  </button>
                  <button onClick={() => deleteQuestion(q.id)} className="p-2 text-gray-400 hover:text-red-500">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
            {questions.length === 0 && (
              <p className="text-center text-gray-400 text-sm py-4">問題がまだありません</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const QuestionEditor = ({ question, onSave, onCancel }) => {
  const [q, setQ] = useState(question);
  const fileInputRef = useRef(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 500000) { 
        alert("画像サイズが大きすぎます。読み込みが遅くなる可能性があります。");
      }
      try {
        const base64 = await convertImageToBase64(file);
        setQ({ ...q, image: base64 });
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleOptionChange = (idx, val) => {
    const newOptions = [...q.options];
    newOptions[idx] = val;
    setQ({ ...q, options: newOptions });
  };

  const addOption = () => {
    setQ({ ...q, options: [...q.options, ''] });
  };

  const removeOption = (idx) => {
    if (q.options.length <= 2) {
      alert('選択肢は最低2つ必要です');
      return;
    }
    const optionToRemove = q.options[idx];
    const newOptions = q.options.filter((_, i) => i !== idx);
    const newCorrect = q.correctAnswer.filter(ans => ans !== optionToRemove);
    setQ({ ...q, options: newOptions, correctAnswer: newCorrect });
  };

  const toggleCorrectAnswer = (optionValue) => {
    let newCorrect;
    if (q.type === 'multiple') {
      newCorrect = [optionValue];
    } else {
      if (q.correctAnswer.includes(optionValue)) {
        newCorrect = q.correctAnswer.filter(c => c !== optionValue);
      } else {
        newCorrect = [...q.correctAnswer, optionValue];
      }
    }
    setQ({ ...q, correctAnswer: newCorrect });
  };

  const addInputAnswer = () => {
    setQ({ ...q, correctAnswer: [...q.correctAnswer, ''] });
  };
  
  const updateInputAnswer = (idx, val) => {
    const newCorrect = [...q.correctAnswer];
    newCorrect[idx] = val;
    setQ({ ...q, correctAnswer: newCorrect });
  };

  const removeInputAnswer = (idx) => {
    if (q.correctAnswer.length <= 1) return;
    const newCorrect = q.correctAnswer.filter((_, i) => i !== idx);
    setQ({ ...q, correctAnswer: newCorrect });
  };

  return (
    <div className="bg-white dark:bg-gray-800 min-h-screen">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800 z-10">
        <button onClick={onCancel} className="text-gray-500">キャンセル</button>
        <h2 className="font-bold text-gray-800 dark:text-white">問題の編集</h2>
        <button 
          onClick={() => onSave(q)} 
          className="text-blue-600 font-bold disabled:opacity-50"
          disabled={!q.text || q.correctAnswer.length === 0 || (q.correctAnswer.length === 1 && q.correctAnswer[0] === '')}
        >
          完了
        </button>
      </div>

      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">出題形式</label>
          <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
            <button 
              className={`flex-1 py-2 rounded-md text-sm font-bold flex items-center justify-center transition-all ${q.type === 'multiple' ? 'bg-white dark:bg-gray-600 shadow text-blue-600 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400'}`}
              onClick={() => setQ({ ...q, type: 'multiple', correctAnswer: [] })}
            >
              <List size={16} className="mr-2" /> 単一選択
            </button>
            <button 
              className={`flex-1 py-2 rounded-md text-sm font-bold flex items-center justify-center transition-all ${q.type === 'multi-select' ? 'bg-white dark:bg-gray-600 shadow text-orange-600 dark:text-orange-300' : 'text-gray-500 dark:text-gray-400'}`}
              onClick={() => setQ({ ...q, type: 'multi-select', correctAnswer: [] })}
            >
              <CheckSquare size={16} className="mr-2" /> 複数選択
            </button>
            <button 
              className={`flex-1 py-2 rounded-md text-sm font-bold flex items-center justify-center transition-all ${q.type === 'input' ? 'bg-white dark:bg-gray-600 shadow text-purple-600 dark:text-purple-300' : 'text-gray-500 dark:text-gray-400'}`}
              onClick={() => setQ({ ...q, type: 'input', correctAnswer: [''] })}
            >
              <Type size={16} className="mr-2" /> 記述
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">問題文</label>
          <textarea 
            className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white h-32"
            value={q.text}
            onChange={(e) => setQ({ ...q, text: e.target.value })}
            placeholder="ここに問題を入力..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">添付画像 (任意)</label>
          <div className="flex items-start space-x-4">
            {q.image ? (
              <div className="relative">
                <img src={q.image} alt="Preview" className="h-32 w-auto rounded border dark:border-gray-600 object-cover" />
                <button 
                  onClick={() => setQ({ ...q, image: null })}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="h-32 w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <ImageIcon size={32} className="mb-2" />
                <span className="text-xs">画像をアップロード</span>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleImageUpload}
            />
          </div>
        </div>

        {q.type !== 'input' ? (
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                選択肢 ({q.type === 'multiple' ? '正解を1つ選択' : '正解を全て選択'})
              </label>
              <button 
                onClick={addOption}
                className="text-xs flex items-center bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100"
              >
                <PlusCircle size={14} className="mr-1" /> 選択肢を追加
              </button>
            </div>
            
            <div className="space-y-3">
              {q.options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input 
                    type={q.type === 'multiple' ? 'radio' : 'checkbox'}
                    name="correct-opt"
                    checked={q.correctAnswer.includes(opt) && opt !== ''}
                    onChange={() => toggleCorrectAnswer(opt)}
                    className="w-5 h-5 text-blue-600 cursor-pointer"
                  />
                  <input 
                    type="text" 
                    value={opt}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    className="flex-1 p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder={`選択肢 ${idx + 1}`}
                  />
                  <button 
                    onClick={() => removeOption(idx)}
                    className="text-gray-400 hover:text-red-500"
                    title="削除"
                  >
                    <MinusCircle size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                正解のキーワード (別解も登録可)
              </label>
              <button 
                onClick={addInputAnswer}
                className="text-xs flex items-center bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100"
              >
                <PlusCircle size={14} className="mr-1" /> 別解を追加
              </button>
            </div>
            
            <div className="space-y-3">
              {q.correctAnswer.map((ans, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-gray-400 text-sm font-bold w-6 text-center">{idx + 1}.</span>
                  <input 
                    type="text" 
                    className="flex-1 p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={ans}
                    onChange={(e) => updateInputAnswer(idx, e.target.value)}
                    placeholder="正解を入力（完全一致で判定されます）"
                  />
                  {q.correctAnswer.length > 1 && (
                    <button 
                      onClick={() => removeInputAnswer(idx)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <MinusCircle size={20} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">※ユーザーが入力した値と完全に一致した場合に正解となります。</p>
          </div>
        )}
      </div>
    </div>
  );
};

const GameView = ({ quiz, isRandom, shuffleOptions, onFinish }) => {
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState([]); 
  const [startTime, setStartTime] = useState(null);
  const [qStartTime, setQStartTime] = useState(null);
  const [inputText, setInputText] = useState('');
  const [selectedOptions, setSelectedOptions] = useState([]);

  const questionOrder = useMemo(() => {
    let order = [...quiz.questions];
    if (isRandom) order = order.sort(() => Math.random() - 0.5);

    if (shuffleOptions) {
      order = order.map(q => {
        if (q.type === 'input') return q; 
        const shuffledOptions = [...q.options].sort(() => Math.random() - 0.5);
        return {
          ...q,
          options: shuffledOptions,
        };
      });
    }
    return order;
  }, [quiz, isRandom, shuffleOptions]);

  useEffect(() => {
    setStartTime(Date.now());
    setQStartTime(Date.now());
  }, []);

  useEffect(() => {
    setQStartTime(Date.now());
    setInputText('');
    setSelectedOptions([]);
  }, [currentQIndex]);

  const handleAnswer = (answerVal) => {
    const now = Date.now();
    const currentQ = questionOrder[currentQIndex];
    let isCorrect = false;
    let finalSelectedAnswer = answerVal;

    if (currentQ.type === 'multiple') {
      isCorrect = currentQ.correctAnswer.includes(answerVal);
    } else if (currentQ.type === 'multi-select') {
      const correctSet = new Set(currentQ.correctAnswer);
      const selectedSet = new Set(answerVal);
      if (correctSet.size === selectedSet.size) {
        isCorrect = [...correctSet].every(val => selectedSet.has(val));
      }
      finalSelectedAnswer = answerVal;
    } else {
      isCorrect = currentQ.correctAnswer.some(ans => ans.trim() === answerVal.trim());
    }
    
    const answerRecord = {
      question: currentQ,
      selectedAnswer: finalSelectedAnswer,
      isCorrect: isCorrect,
      timeTaken: now - qStartTime,
      id: currentQ.id 
    };

    const newAnswers = [...answers, answerRecord];
    setAnswers(newAnswers);

    if (currentQIndex < questionOrder.length - 1) {
      setCurrentQIndex(prev => prev + 1);
    } else {
      const totalTime = now - startTime;
      onFinish(newAnswers, totalTime);
    }
  };

  const toggleMultiSelect = (option) => {
    if (selectedOptions.includes(option)) {
      setSelectedOptions(selectedOptions.filter(o => o !== option));
    } else {
      setSelectedOptions([...selectedOptions, option]);
    }
  };

  const currentQuestion = questionOrder[currentQIndex];
  const progress = ((currentQIndex) / questionOrder.length) * 100;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-1">
          <span>Question {currentQIndex + 1} / {questionOrder.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
        <div className="mb-4">
          <span className={`inline-block px-2 py-1 rounded text-xs font-bold mb-2 ${currentQuestion.type === 'input' ? 'bg-purple-100 text-purple-600' : currentQuestion.type === 'multi-select' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
            {currentQuestion.type === 'input' ? '記述式' : currentQuestion.type === 'multi-select' ? '複数選択 (全て選べ)' : '単一選択'}
          </span>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 leading-relaxed whitespace-pre-line">{currentQuestion.text}</h2>
        </div>

        {currentQuestion.image && <div className="mb-6 flex justify-center"><img src={currentQuestion.image} alt="Question" className="max-h-64 rounded-lg border dark:border-gray-600 object-contain" /></div>}
        {currentQuestion.tableData && <div className="mb-8"><SimpleTable data={currentQuestion.tableData} /></div>}
        <div className="mb-4"></div>

        {currentQuestion.type === 'multiple' && (
          <div className="space-y-4">
            {currentQuestion.options.map((option, idx) => (
              <button key={idx} onClick={() => handleAnswer(option)} className="w-full text-left p-4 rounded-xl border-2 border-gray-100 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all group flex items-center bg-white dark:bg-gray-800">
                <span className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center font-bold mr-4 group-hover:bg-blue-500 group-hover:text-white transition-colors flex-shrink-0">{idx + 1}</span>
                <span className="text-gray-700 dark:text-gray-200 font-medium">{option}</span>
              </button>
            ))}
          </div>
        )}

        {currentQuestion.type === 'multi-select' && (
          <div className="space-y-4">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = selectedOptions.includes(option);
              return (
                <button key={idx} onClick={() => toggleMultiSelect(option)} className={`w-full text-left p-4 rounded-xl border-2 transition-all group flex items-center ${isSelected ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' : 'border-gray-100 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                  <div className={`w-6 h-6 rounded border-2 mr-4 flex items-center justify-center transition-colors ${isSelected ? 'bg-orange-500 border-orange-500 text-white' : 'border-gray-300 bg-white'}`}>{isSelected && <CheckCircle size={16} />}</div>
                  <span className="text-gray-700 dark:text-gray-200 font-medium">{option}</span>
                </button>
              );
            })}
            <button onClick={() => handleAnswer(selectedOptions)} className="w-full mt-4 bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-xl shadow transition-colors disabled:opacity-50" disabled={selectedOptions.length === 0}>回答を確定する</button>
          </div>
        )}

        {currentQuestion.type === 'input' && (
          <div className="space-y-4">
            <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} className="w-full p-4 text-lg border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-blue-500 dark:focus:border-blue-500 outline-none dark:bg-gray-700 dark:text-white" placeholder="回答を入力..." onKeyDown={(e) => { if (e.key === 'Enter' && inputText.trim()) { handleAnswer(inputText); } }} />
            <button onClick={() => handleAnswer(inputText)} disabled={!inputText.trim()} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-4 rounded-xl shadow transition-colors">回答する</button>
          </div>
        )}
      </div>
    </div>
  );
};

const ResultView = ({ resultData, onRetry, onBackToMenu }) => {
  const { answers, totalTime } = resultData;
  const correctCount = answers.filter(a => a.isCorrect).length;
  const totalCount = answers.length;
  const accuracy = Math.round((correctCount / totalCount) * 100);
  const formattedTime = `${Math.floor(totalTime / 1000)}秒`;

  let comment = "もう一歩！";
  let color = "text-yellow-500";
  if (accuracy === 100) { comment = "パーフェクト！完璧だ！"; color = "text-green-500"; } 
  else if (accuracy >= 80) { comment = "素晴らしい！合格圏内だ。"; color = "text-blue-500"; } 
  else if (accuracy < 50) { comment = "もう少し復習が必要かも。"; color = "text-red-500"; }

  const renderCorrectAnswer = (q) => {
    if (q.type === 'multiple') return q.correctAnswer[0];
    if (q.type === 'multi-select') return q.correctAnswer.join(', ');
    if (q.type === 'input') return q.correctAnswer.join(' または ');
    return '';
  };

  const renderUserAnswer = (ans) => {
    if (Array.isArray(ans.selectedAnswer)) return ans.selectedAnswer.join(', ');
    return ans.selectedAnswer;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-8 text-center bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
        <h2 className="text-lg text-gray-500 dark:text-gray-400 font-bold mb-2">RESULT</h2>
        <div className={`text-4xl font-black mb-2 ${color}`}>{accuracy}%</div>
        <p className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">{correctCount} / {totalCount} 問正解</p>
        <p className="text-gray-600 dark:text-gray-300 font-medium mb-4">{comment}</p>
        <div className="flex justify-center items-center text-gray-500 dark:text-gray-400 text-sm"><Clock size={16} className="mr-1" /> かかった時間: {formattedTime}</div>
      </div>
      <div className="p-6 bg-gray-50/50 dark:bg-gray-900/50">
        <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-4">詳細レポート</h3>
        <div className="space-y-4">
          {answers.map((ans, idx) => (
            <div key={idx} className={`bg-white dark:bg-gray-800 p-4 rounded-lg border-l-4 shadow-sm ${ans.isCorrect ? 'border-green-500' : 'border-red-500'}`}>
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-sm text-gray-500 dark:text-gray-400">Q{idx + 1}</span>
                {ans.isCorrect ? <span className="flex items-center text-green-600 text-sm font-bold"><CheckCircle size={16} className="mr-1"/> 正解</span> : <span className="flex items-center text-red-600 text-sm font-bold"><XCircle size={16} className="mr-1"/> 不正解</span>}
              </div>
              <p className="text-gray-800 dark:text-gray-200 font-medium mb-2 whitespace-pre-line">{ans.question.text}</p>
              {ans.question.image && <img src={ans.question.image} className="h-20 w-auto object-contain border rounded mb-2" alt="Q" />}
              <div className="text-sm grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                <div className={`p-2 rounded ${ans.isCorrect ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300' : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300'}`}><span className="text-xs opacity-70 block">あなたの回答</span>{renderUserAnswer(ans)}</div>
                {!ans.isCorrect && <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 p-2 rounded"><span className="text-xs opacity-70 block">正解</span>{renderCorrectAnswer(ans.question)}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-4 justify-center bg-white dark:bg-gray-800 sticky bottom-0">
        <button onClick={onRetry} className="flex-1 bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center transition-colors"><RotateCcw size={18} className="mr-2" /> もう一度挑戦</button>
        <button onClick={onBackToMenu} className="flex-1 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-bold py-3 px-6 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center transition-colors"><ArrowLeft size={18} className="mr-2" /> メニューに戻る</button>
      </div>
    </div>
  );
};

const SettingsView = ({ theme, changeTheme, onBack }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden max-w-2xl mx-auto">
      <div className="bg-gray-50 dark:bg-gray-700 p-6 border-b border-gray-200 dark:border-gray-600 flex items-center">
        <button onClick={onBack} className="mr-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"><ArrowLeft size={24} /></button>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">アプリ設定</h2>
      </div>
      <div className="p-6 space-y-6">
        <div className="p-4 border rounded-xl border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50">
          <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-4">外観テーマ</h3>
          <div className="grid grid-cols-3 gap-3">
            {[ { id: 'light', label: 'ライト', icon: Sun }, { id: 'dark', label: 'ダーク', icon: Moon }, { id: 'system', label: 'システム', icon: Monitor } ].map((mode) => (
              <button key={mode.id} onClick={() => changeTheme(mode.id)} className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${theme === mode.id ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'border-transparent bg-white dark:bg-gray-600 text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-500'}`}>
                <mode.icon size={24} className="mb-2" />
                <span className="text-xs font-bold">{mode.label}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="text-center text-sm text-gray-400 mt-8">{APP_VERSION} - Creator Edition Pro</div>
      </div>
    </div>
  );
};

const QuizMenuView = ({ quiz, onStart, isReviewMode, onClearHistory, onEdit }) => {
  const [randomize, setRandomize] = useState(false);
  const [shuffleOptions, setShuffleOptions] = useState(false);
  const isMock = quiz.isMock;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="bg-gray-50 dark:bg-gray-700 p-6 border-b border-gray-200 dark:border-gray-600 flex justify-between items-start">
        <div><h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{quiz.title}</h2><p className="text-gray-600 dark:text-gray-300">{quiz.description}</p></div>
        {!isMock && !isReviewMode && onEdit && (<button onClick={onEdit} className="p-2 bg-white dark:bg-gray-600 text-gray-500 dark:text-gray-200 rounded border hover:bg-gray-50 shadow-sm"><Edit3 size={20} /></button>)}
      </div>
      <div className="p-6">
        {!isMock && (
          <div className="mb-8">
            <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center"><Settings size={18} className="mr-2" /> 設定</h3>
            <div className="space-y-2">
              <label className="flex items-center space-x-3 cursor-pointer p-3 border dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <input type="checkbox" checked={randomize} onChange={(e) => setRandomize(e.target.checked)} className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500 bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500" />
                <span className="text-gray-700 dark:text-gray-200">出題順をランダムにする</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer p-3 border dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <input type="checkbox" checked={shuffleOptions} onChange={(e) => setShuffleOptions(e.target.checked)} className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500 bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500" />
                <span className="text-gray-700 dark:text-gray-200 flex items-center"><Shuffle size={16} className="mr-2" /> 選択肢をシャッフルする</span>
              </label>
            </div>
          </div>
        )}
        {!isMock ? (
          <div className="mb-8">
            <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-4">収録されている問題 ({quiz.questions.length}問)</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {quiz.questions.map((q, idx) => (
                <div key={q.id} className="text-sm p-3 bg-gray-50 dark:bg-gray-700/50 rounded border border-gray-100 dark:border-gray-600 text-gray-600 dark:text-gray-300 flex justify-between">
                  <div className="truncate flex-1"><span className="font-bold text-blue-500 dark:text-blue-400 mr-2">Q{idx + 1}.</span>{q.text}</div>
                  <div className="flex gap-2 ml-2">{q.image && <ImageIcon size={16} />}{q.type === 'input' && <Type size={16} />}{q.type === 'multi-select' && <CheckSquare size={16} />}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mb-8 bg-gray-100 dark:bg-gray-700 p-8 rounded-xl border border-gray-200 dark:border-gray-600 text-center flex flex-col items-center justify-center">
            <Lock size={48} className="text-gray-400 dark:text-gray-500 mb-3" />
            <h3 className="font-bold text-gray-600 dark:text-gray-300 text-lg">Question List Hidden</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">本番形式の模試のため、問題内容は開始するまで表示されません。<br/>出題順序は自動的にシャッフルされます。</p>
          </div>
        )}
        <div className="flex flex-col gap-3">
          <button onClick={() => onStart(isMock ? false : randomize, isMock ? true : shuffleOptions)} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-md transition-transform transform active:scale-95 flex items-center justify-center text-lg disabled:opacity-50 disabled:cursor-not-allowed" disabled={quiz.questions.length === 0}>
            <Play size={24} className="mr-2 fill-current" />
            {quiz.questions.length > 0 ? "テストを開始する" : "問題がありません"}
          </button>
          {isReviewMode && <button onClick={onClearHistory} className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-800 font-bold py-3 rounded-xl transition-colors flex items-center justify-center text-sm"><Trash2 size={16} className="mr-2" /> 履歴をリセット（全て覚えた）</button>}
        </div>
      </div>
    </div>
  );
};

// Changelog Modal
const ChangelogModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-600 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center"><Info size={24} className="mr-2 text-blue-600" /> 更新情報</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"><X size={20} className="text-gray-500 dark:text-gray-400" /></button>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <div className="flex items-center mb-2"><span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded mr-2">Latest</span><h3 className="font-bold text-lg text-gray-800 dark:text-white">v2.1.0 - 多機能化アップデート</h3></div>
            <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 space-y-1 ml-1">
              <li>複数選択（チェックボックス）形式の問題に対応しました。</li>
              <li>選択肢の数を自由に設定できるようになりました（2つ以上）。</li>
              <li>記述式問題で複数の正解（別解）を設定できるようになりました。</li>
              <li>既存のデータ構造を新形式へ自動変換する機能を追加しました。</li>
              <li>UIの微調整（フォルダ名の表示崩れ修正など）を行いました。</li>
            </ul>
          </div>
          <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
            <h3 className="font-bold text-md text-gray-700 dark:text-gray-200 mb-2">v2.0.0 - クリエイター機能実装</h3>
            <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 space-y-1 ml-1">
              <li>自分でフォルダや問題セットを作成・編集できる機能を追加しました。</li>
              <li>画像付き問題の作成に対応しました。</li>
              <li>ダークモード/ライトモードの手動・システム切り替えに対応しました。</li>
            </ul>
          </div>
          <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
            <h3 className="font-bold text-md text-gray-700 dark:text-gray-200 mb-2">v1.2.0 - 学習機能強化</h3>
            <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 space-y-1 ml-1">
              <li>実力診断模試（ランダム出題）機能を追加しました。</li>
              <li>間違えた問題を復習できる「弱点克服モード」を追加しました。</li>
              <li>学習履歴の保存機能を追加しました。</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [view, setView] = useState('home');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [gameSettings, setGameSettings] = useState({ randomize: false, shuffleOptions: false });
  const [resultData, setResultData] = useState(null);
  const [showChangelog, setShowChangelog] = useState(false);

  // Define nav functions BEFORE return and before other components might need them
  const goHome = () => { setView('home'); setSelectedCourse(null); setSelectedQuiz(null); setResultData(null); };

  const getPath = () => {
    const path = [];
    if (selectedCourse) path.push({ title: selectedCourse.title, id: selectedCourse.id, type: 'course' });
    if (selectedQuiz && view !== 'course' && view !== 'edit_quiz') path.push({ title: selectedQuiz.title, id: selectedQuiz.id, type: 'quiz_menu' });
    return path;
  };
  
  const handleBreadcrumbNavigate = (type, id) => {
    if (type === 'home') goHome();
    if (type === 'course') { setView('course'); setSelectedQuiz(null); }
  };

  const [courses, setCourses] = useState(() => {
    try {
      const saved = localStorage.getItem('study-master-data');
      return saved ? normalizeData(JSON.parse(saved)) : normalizeData(INITIAL_DATA);
    } catch (e) { return normalizeData(INITIAL_DATA); }
  });

  const [wrongHistory, setWrongHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('study-master-wrong-history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  const [errorStats, setErrorStats] = useState(() => {
    try {
      const saved = localStorage.getItem('study-master-error-stats');
      return saved ? JSON.parse(saved) : {};
    } catch (e) { return {}; }
  });

  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('study-master-theme') || 'system';
    return 'system';
  });

  useEffect(() => { localStorage.setItem('study-master-data', JSON.stringify(courses)); }, [courses]);
  useEffect(() => { localStorage.setItem('study-master-wrong-history', JSON.stringify(wrongHistory)); }, [wrongHistory]);
  useEffect(() => { localStorage.setItem('study-master-error-stats', JSON.stringify(errorStats)); }, [errorStats]);

  useEffect(() => {
    localStorage.setItem('study-master-theme', theme);
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else if (theme === 'light') root.classList.remove('dark');
    else {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) root.classList.add('dark');
      else root.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    if (theme !== 'system') return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      if (e.matches) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const handleCreateCourse = (title, desc) => {
    const newCourse = { id: `course-${generateId()}`, title, description: desc, quizzes: [] };
    setCourses([...courses, newCourse]);
    setView('home');
  };

  const handleDeleteCourse = (id) => {
    if (confirm('このフォルダを削除しますか？中の問題もすべて消えます。')) {
      setCourses(courses.filter(c => c.id !== id));
    }
  };

  const handleCreateQuiz = () => {
    const newQuiz = { id: `quiz-${generateId()}`, title: '新規問題セット', description: '', questions: [] };
    setSelectedQuiz(newQuiz);
    setView('edit_quiz');
  };

  const handleSaveQuiz = (updatedQuiz) => {
    const courseIndex = courses.findIndex(c => c.id === selectedCourse.id);
    if (courseIndex === -1) return;
    const newCourses = [...courses];
    const quizIndex = newCourses[courseIndex].quizzes.findIndex(q => q.id === updatedQuiz.id);
    if (quizIndex > -1) newCourses[courseIndex].quizzes[quizIndex] = updatedQuiz;
    else newCourses[courseIndex].quizzes.push(updatedQuiz);
    setCourses(newCourses);
    setSelectedCourse(newCourses[courseIndex]);
    setView('course');
    setSelectedQuiz(null);
  };

  const handleDeleteQuiz = (quizId) => {
    if (!confirm('この問題セットを削除しますか？')) return;
    const courseIndex = courses.findIndex(c => c.id === selectedCourse.id);
    const newCourses = [...courses];
    newCourses[courseIndex].quizzes = newCourses[courseIndex].quizzes.filter(q => q.id !== quizId);
    setCourses(newCourses);
    setSelectedCourse(newCourses[courseIndex]);
  };

  const startQuiz = (randomize, shuffleOptions) => {
    setGameSettings({ randomize, shuffleOptions });
    setView('quiz_play');
  };

  const finishQuiz = (answers, totalTime) => {
    setResultData({ answers, totalTime });
    setView('result');
    const currentWrongs = answers.filter(a => !a.isCorrect).map(a => a.question.id);
    const currentCorrects = answers.filter(a => a.isCorrect).map(a => a.question.id);
    const isReview = selectedQuiz?.id === 'review-mode';

    if (currentWrongs.length > 0) {
      setErrorStats(prev => {
        const newStats = { ...prev };
        currentWrongs.forEach(id => { newStats[id] = (newStats[id] || 0) + 1; });
        return newStats;
      });
    }

    setWrongHistory(prev => {
      let newHistory = [...prev];
      currentWrongs.forEach(id => { if (!newHistory.includes(id)) newHistory.push(id); });
      if (isReview) newHistory = newHistory.filter(id => !currentCorrects.includes(id));
      return newHistory;
    });
  };
  
  const clearHistory = () => {
    if (confirm('復習リストをリセットしますか？')) {
      setWrongHistory([]);
      goHome();
    }
  };

  return (
    <div className={`min-h-screen font-sans text-gray-800 dark:text-gray-100 bg-gray-100 dark:bg-gray-900 transition-colors duration-200`}>
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 transition-colors">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={goHome}>
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 text-white p-2 rounded-lg shadow-md transform transition-transform hover:scale-105">
              <BookOpen size={24} />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-black tracking-tight text-gray-900 dark:text-white leading-none">Study Master</h1>
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Professional</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={() => setShowChangelog(true)} className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="更新情報"><Bell size={20} /></button>
            <button onClick={() => setView('settings')} className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="設定"><Settings size={20} /></button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 pb-20">
        {view !== 'home' && view !== 'settings' && view !== 'create_course' && (
          <Breadcrumbs path={getPath()} onNavigate={handleBreadcrumbNavigate} />
        )}

        <div className="animate-fade-in">
          {view === 'home' && <><h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">科目の選択</h2><FolderListView courses={courses} onSelectCourse={(c) => { setSelectedCourse(c); setView('course'); }} onCreateCourse={() => setView('create_course')} onDeleteCourse={handleDeleteCourse} /></>}
          {view === 'settings' && <SettingsView theme={theme} changeTheme={setTheme} onBack={goHome} />}
          {view === 'create_course' && <CreateCourseModal onClose={goHome} onSave={handleCreateCourse} />}
          {view === 'course' && selectedCourse && <><div className="mb-6"><h2 className="text-2xl font-bold text-gray-800 dark:text-white">{selectedCourse.title}</h2><p className="text-gray-500 dark:text-gray-400">{selectedCourse.description}</p></div><QuizListView course={selectedCourse} onSelectQuiz={(q) => { setSelectedQuiz(q); setView('quiz_menu'); }} wrongHistory={wrongHistory} onSelectReview={(q) => { setSelectedQuiz(q); setView('quiz_menu'); }} onCreateQuiz={handleCreateQuiz} onDeleteQuiz={handleDeleteQuiz} /></>}
          {view === 'edit_quiz' && <QuizEditor quiz={selectedQuiz} onSave={handleSaveQuiz} onCancel={() => { setView('course'); setSelectedQuiz(null); }} />}
          {view === 'quiz_menu' && selectedQuiz && <QuizMenuView quiz={selectedQuiz} onStart={startQuiz} isReviewMode={selectedQuiz.id === 'review-mode'} onClearHistory={clearHistory} onEdit={selectedQuiz.isMock || selectedQuiz.id === 'review-mode' ? null : () => setView('edit_quiz')} />}
          {view === 'quiz_play' && selectedQuiz && <GameView quiz={selectedQuiz} isRandom={gameSettings.randomize} shuffleOptions={gameSettings.shuffleOptions} onFinish={finishQuiz} />}
          {view === 'result' && resultData && <ResultView resultData={resultData} onRetry={() => startQuiz(gameSettings.randomize, gameSettings.shuffleOptions)} onBackToMenu={() => setView('course')} />}
        </div>
      </main>
      {showChangelog && <ChangelogModal onClose={() => setShowChangelog(false)} />}
    </div>
  );
}